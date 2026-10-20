package ru.itmo.is.lab.realtime;

import javax.websocket.SendResult;
import javax.websocket.Session;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BiConsumer;

/**
 * Одна WebSocket-сессия и её очередь исходящих сообщений.
 *
 * <p>По спецификации Java WebSocket новая асинхронная отправка, начатая до завершения
 * предыдущей, может бросить {@code IllegalStateException}. Рассылка идёт из разных потоков
 * (каждый commit — свой поток запроса), поэтому сообщения встают в очередь и уходят
 * строго по одному: следующее отправляется из колбэка завершения предыдущего.
 *
 * <p>Любая ошибка отправки (сессия закрыта, сеть оборвалась, очередь переполнена у
 * медленного клиента) один раз сообщается владельцу через {@code onFailure}; дальше
 * соединение считается мёртвым и ничего не отправляет.
 */
final class ClientConnection {

    /** Сообщения — только сигналы; если клиент отстал на столько, проще переподключить его. */
    static final int MAX_PENDING = 64;

    private final Session session;
    private final BiConsumer<ClientConnection, Throwable> onFailure;
    private final Queue<String> pending = new ConcurrentLinkedQueue<>();
    private final AtomicBoolean sending = new AtomicBoolean();
    private final AtomicBoolean failed = new AtomicBoolean();

    ClientConnection(Session session, BiConsumer<ClientConnection, Throwable> onFailure) {
        this.session = session;
        this.onFailure = onFailure;
    }

    Session session() {
        return session;
    }

    String id() {
        return session.getId();
    }

    void send(String text) {
        if (failed.get()) {
            return;
        }
        if (!session.isOpen()) {
            fail(new IllegalStateException("сессия закрыта"));
            return;
        }
        if (pending.size() >= MAX_PENDING) {
            fail(new IllegalStateException("клиент не успевает принимать сообщения"));
            return;
        }
        pending.add(text);
        drain();
    }

    private void drain() {
        while (!failed.get()) {
            if (!sending.compareAndSet(false, true)) {
                return; // отправка уже идёт — колбэк завершения заберёт следующее сообщение
            }
            String next = pending.poll();
            if (next == null) {
                sending.set(false);
                if (pending.isEmpty()) {
                    return;
                }
                continue; // сообщение добавили между poll() и set(false)
            }
            try {
                session.getAsyncRemote().sendText(next, this::onSent);
            } catch (RuntimeException e) {
                fail(e);
            }
            return;
        }
    }

    private void onSent(SendResult result) {
        if (!result.isOK()) {
            fail(result.getException());
            return;
        }
        sending.set(false);
        drain();
    }

    private void fail(Throwable cause) {
        if (failed.compareAndSet(false, true)) {
            pending.clear();
            onFailure.accept(this, cause);
        }
    }
}
