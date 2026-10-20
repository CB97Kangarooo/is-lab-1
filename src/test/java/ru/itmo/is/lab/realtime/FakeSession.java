package ru.itmo.is.lab.realtime;

import javax.websocket.RemoteEndpoint;
import javax.websocket.SendHandler;
import javax.websocket.SendResult;
import javax.websocket.Session;
import java.lang.reflect.Proxy;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/**
 * Поддельная WebSocket-сессия на {@link Proxy}: интерфейс {@link Session} большой,
 * а тесту нужны четыре метода. Режим отправки задаётся полем {@link #mode}.
 */
final class FakeSession {

    enum Mode {
        /** Отправка сразу завершается успешно. */
        OK,
        /** Колбэк получает ошибку, как при оборванной сети. */
        FAIL_RESULT,
        /** sendText бросает исключение, как на закрытой сессии. */
        THROW,
        /** Отправка «висит», пока тест не вызовет {@link #completeNext()}. */
        DEFERRED
    }

    final String id;
    final List<String> sent = new ArrayList<>();
    final Deque<SendHandler> inFlight = new ArrayDeque<>();
    volatile boolean open = true;
    volatile boolean closed;
    Mode mode = Mode.OK;
    final Session session;

    FakeSession(String id) {
        this.id = id;
        RemoteEndpoint.Async async = (RemoteEndpoint.Async) Proxy.newProxyInstance(
                getClass().getClassLoader(), new Class<?>[]{RemoteEndpoint.Async.class},
                (proxy, method, args) -> {
                    if (method.getName().equals("sendText") && args.length == 2) {
                        sendText((String) args[0], (SendHandler) args[1]);
                        return null;
                    }
                    throw new UnsupportedOperationException(method.getName());
                });
        this.session = (Session) Proxy.newProxyInstance(
                getClass().getClassLoader(), new Class<?>[]{Session.class},
                (proxy, method, args) -> {
                    switch (method.getName()) {
                        case "getId": return this.id;
                        case "isOpen": return open;
                        case "getAsyncRemote": return async;
                        case "close":
                            open = false;
                            closed = true;
                            return null;
                        case "hashCode": return System.identityHashCode(proxy);
                        case "equals": return proxy == args[0];
                        case "toString": return "FakeSession(" + this.id + ")";
                        default: throw new UnsupportedOperationException(method.getName());
                    }
                });
    }

    private void sendText(String text, SendHandler handler) {
        switch (mode) {
            case THROW:
                throw new IllegalStateException("The WebSocket session has been closed");
            case FAIL_RESULT:
                handler.onResult(new SendResult(new java.io.IOException("Broken pipe")));
                return;
            case DEFERRED:
                if (!inFlight.isEmpty()) {
                    throw new IllegalStateException("предыдущая отправка ещё не завершена");
                }
                sent.add(text);
                inFlight.add(handler);
                return;
            default:
                sent.add(text);
                handler.onResult(new SendResult());
        }
    }

    void completeNext() {
        inFlight.poll().onResult(new SendResult());
    }
}
