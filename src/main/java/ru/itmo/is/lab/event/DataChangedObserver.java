package ru.itmo.is.lab.event;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.enterprise.event.TransactionPhase;
import java.util.logging.Logger;

@ApplicationScoped
public class DataChangedObserver {

    private static final Logger LOGGER = Logger.getLogger(DataChangedObserver.class.getName());

    public void onDataChanged(@Observes(during = TransactionPhase.AFTER_SUCCESS) DataChangedEvent event) {
        LOGGER.info(() -> "Изменены данные: " + event.getEntityType()
                + " id=" + event.getEntityId() + ", действие=" + event.getChangeType());
    }
}
