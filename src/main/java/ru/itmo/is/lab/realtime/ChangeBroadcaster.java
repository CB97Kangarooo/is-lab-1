package ru.itmo.is.lab.realtime;

import javax.enterprise.context.ApplicationScoped;
import javax.websocket.CloseReason;
import javax.websocket.Session;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Реестр открытых WebSocket-сессий и рассылка сигналов всем клиентам.
 *
 * <p>Один экземпляр на приложение: эндпоинт создаётся контейнером на каждое соединение,
 * а сессии всех соединений должны жить в одном наборе. Набор — {@link ConcurrentHashMap}
 * по id сессии: регистрация, удаление и рассылка идут из разных потоков без общей блокировки.
 * Ошибка отправки в одну сессию не прерывает рассылку остальным: такая сессия
 * удаляется из набора и закрывается.
 */
@ApplicationScoped
public class ChangeBroadcaster {

    private static final Logger LOGGER = Logger.getLogger(ChangeBroadcaster.class.getName());

    private final Map<String, ClientConnection> connections = new ConcurrentHashMap<>();

    public void register(Session session) {
        connections.put(session.getId(), new ClientConnection(session, this::drop));
        LOGGER.info(() -> "WebSocket: клиент подключён (" + session.getId() + "), активных сессий: " + sessionCount());
    }

    /** Повторный вызов безопасен: @OnError и @OnClose приходят для одной и той же сессии. */
    public void unregister(Session session) {
        if (connections.remove(session.getId()) != null) {
            LOGGER.info(() -> "WebSocket: клиент отключён (" + session.getId() + "), активных сессий: " + sessionCount());
        }
    }

    public void broadcast(String message) {
        for (ClientConnection connection : connections.values()) {
            connection.send(message);
        }
    }

    public void sendTo(Session session, String message) {
        ClientConnection connection = connections.get(session.getId());
        if (connection != null) {
            connection.send(message);
        }
    }

    public int sessionCount() {
        return connections.size();
    }

    private void drop(ClientConnection connection, Throwable cause) {
        // remove(key, value): не удалить новую сессию, если id вдруг переиспользован
        if (connections.remove(connection.id(), connection)) {
            // обрыв клиента — штатная ситуация: причина одной строкой, stack trace только на FINE
            LOGGER.info(() -> "WebSocket: сессия " + connection.id() + " отброшена при отправке ("
                    + cause + "), активных сессий: " + sessionCount());
            LOGGER.log(Level.FINE, "WebSocket: причина отброса сессии " + connection.id(), cause);
        }
        closeQuietly(connection.session());
    }

    private static void closeQuietly(Session session) {
        try {
            if (session.isOpen()) {
                session.close(new CloseReason(CloseReason.CloseCodes.GOING_AWAY, "send failed"));
            }
        } catch (IOException | RuntimeException e) {
            LOGGER.log(Level.FINE, "WebSocket: не удалось закрыть сессию " + session.getId(), e);
        }
    }
}
