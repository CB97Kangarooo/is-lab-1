package ru.itmo.is.lab.realtime;

import ru.itmo.is.lab.event.DataChangedEvent;

import java.util.Locale;

/**
 * Сообщение клиентам — сигнал «данные изменились», без самих данных:
 * {@code {"entity":"human","change":"updated","id":42}}.
 * Клиент по сигналу сам перезапрашивает то, что у него на экране.
 */
public final class ChangeMessage {

    /** Ответ на heartbeat клиента. */
    public static final String PONG = "pong";
    public static final String PING = "ping";

    private ChangeMessage() {
    }

    /**
     * JSON для события или {@code null}, если тип сущности не синхронизируется.
     * Строка собирается вручную: все значения — константы enum'а, фиксированные
     * строки и {@code Long}, экранировать нечего.
     */
    public static String toJson(DataChangedEvent event) {
        String entity = entityOf(event.getEntityType());
        if (entity == null || event.getChangeType() == null) {
            return null;
        }
        String change = event.getChangeType().name().toLowerCase(Locale.ROOT);
        String id = event.getEntityId() == null ? "null" : event.getEntityId().toString();
        return "{\"entity\":\"" + entity + "\",\"change\":\"" + change + "\",\"id\":" + id + "}";
    }

    static String entityOf(String entityType) {
        if ("HumanBeing".equals(entityType)) {
            return "human";
        }
        if ("Car".equals(entityType)) {
            return "car";
        }
        return null;
    }
}
