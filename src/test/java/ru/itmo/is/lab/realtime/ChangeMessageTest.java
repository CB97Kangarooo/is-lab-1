package ru.itmo.is.lab.realtime;

import org.junit.jupiter.api.Test;
import ru.itmo.is.lab.event.ChangeType;
import ru.itmo.is.lab.event.DataChangedEvent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ChangeMessageTest {

    @Test
    void heroChangeCarriesTypeAndId() {
        assertEquals("{\"entity\":\"human\",\"change\":\"updated\",\"id\":42}",
                ChangeMessage.toJson(new DataChangedEvent("HumanBeing", 42L, ChangeType.UPDATED)));
    }

    @Test
    void carCreation() {
        assertEquals("{\"entity\":\"car\",\"change\":\"created\",\"id\":7}",
                ChangeMessage.toJson(new DataChangedEvent("Car", 7L, ChangeType.CREATED)));
    }

    @Test
    void bulkHasNullId() {
        assertEquals("{\"entity\":\"human\",\"change\":\"bulk\",\"id\":null}",
                ChangeMessage.toJson(new DataChangedEvent("HumanBeing", null, ChangeType.BULK)));
    }

    @Test
    void unknownEntityIsNotSent() {
        assertNull(ChangeMessage.toJson(new DataChangedEvent("Coordinates", 1L, ChangeType.DELETED)));
    }
}
