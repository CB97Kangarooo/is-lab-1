package ru.itmo.is.lab.event;

public enum ChangeType {
    CREATED,
    UPDATED,
    DELETED,
    /** Массовая операция: изменено сразу много объектов, {@code entityId == null}. */
    BULK
}
