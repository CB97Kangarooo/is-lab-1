package ru.itmo.is.lab.realtime;

import ru.itmo.is.lab.event.DataChangedEvent;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.enterprise.event.TransactionPhase;
import javax.inject.Inject;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Переводит {@link DataChangedEvent} в WebSocket-сигнал.
 *
 * <p>{@code AFTER_SUCCESS}: метод вызывается только после успешного commit. Если бы сигнал
 * ушёл раньше, другой клиент мог бы перезапросить данные до commit и получить старые;
 * при откате сигнала нет вовсе. Отправка асинхронная, поэтому поток запроса,
 * сделавшего изменение, не ждёт клиентов.
 */
@ApplicationScoped
public class ChangeNotifier {

    private static final Logger LOGGER = Logger.getLogger(ChangeNotifier.class.getName());

    @Inject
    private ChangeBroadcaster broadcaster;

    public void onDataChanged(@Observes(during = TransactionPhase.AFTER_SUCCESS) DataChangedEvent event) {
        String message = ChangeMessage.toJson(event);
        if (message == null) {
            LOGGER.warning(() -> "WebSocket: событие не рассылается, неизвестный тип сущности " + event.getEntityType());
            return;
        }
        try {
            broadcaster.broadcast(message);
        } catch (RuntimeException e) {
            // изменение уже закоммичено: сбой рассылки не должен превращаться в ошибку запроса
            LOGGER.log(Level.WARNING, "WebSocket: рассылка не удалась", e);
        }
    }
}
