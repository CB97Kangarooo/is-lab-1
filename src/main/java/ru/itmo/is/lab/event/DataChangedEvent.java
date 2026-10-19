package ru.itmo.is.lab.event;

public final class DataChangedEvent {

    private final String entityType;
    private final Long entityId;
    private final ChangeType changeType;

    public DataChangedEvent(String entityType, Long entityId, ChangeType changeType) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.changeType = changeType;
    }

    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public ChangeType getChangeType() { return changeType; }
}
