package ru.itmo.is.lab.realtime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChangeBroadcasterTest {

    private ChangeBroadcaster broadcaster;

    @BeforeEach
    void setUp() {
        broadcaster = new ChangeBroadcaster();
    }

    private FakeSession connect(String id) {
        FakeSession fake = new FakeSession(id);
        broadcaster.register(fake.session);
        return fake;
    }

    @Test
    void broadcastReachesEveryOpenSession() {
        FakeSession a = connect("a");
        FakeSession b = connect("b");

        broadcaster.broadcast("m1");

        assertEquals(Collections.singletonList("m1"), a.sent);
        assertEquals(Collections.singletonList("m1"), b.sent);
        assertEquals(2, broadcaster.sessionCount());
    }

    @Test
    void closedSessionIsDroppedAndOthersStillReceive() {
        FakeSession dead = connect("dead");
        FakeSession alive = connect("alive");
        dead.open = false;

        broadcaster.broadcast("m1");

        assertTrue(dead.sent.isEmpty());
        assertEquals(Collections.singletonList("m1"), alive.sent);
        assertEquals(1, broadcaster.sessionCount());
    }

    @Test
    void sessionThatThrowsOnSendIsDroppedAndClosed() {
        FakeSession broken = connect("broken");
        FakeSession alive = connect("alive");
        broken.mode = FakeSession.Mode.THROW;

        broadcaster.broadcast("m1");
        broadcaster.broadcast("m2");

        assertTrue(broken.closed);
        assertEquals(Arrays.asList("m1", "m2"), alive.sent);
        assertEquals(1, broadcaster.sessionCount());
    }

    @Test
    void failedAsyncResultDropsSession() {
        FakeSession broken = connect("broken");
        connect("alive");
        broken.mode = FakeSession.Mode.FAIL_RESULT;

        broadcaster.broadcast("m1");

        assertTrue(broken.closed);
        assertEquals(1, broadcaster.sessionCount());
    }

    @Test
    void messagesAreSentOneAtATimeInOrder() {
        FakeSession slow = connect("slow");
        slow.mode = FakeSession.Mode.DEFERRED;

        broadcaster.broadcast("m1");
        broadcaster.broadcast("m2");
        broadcaster.broadcast("m3");
        // пока первая отправка не завершена, вторая не начинается (иначе IllegalStateException)
        assertEquals(Collections.singletonList("m1"), slow.sent);

        slow.completeNext();
        slow.completeNext();
        slow.completeNext();

        assertEquals(Arrays.asList("m1", "m2", "m3"), slow.sent);
        assertEquals(1, broadcaster.sessionCount());
        assertFalse(slow.closed);
    }

    @Test
    void clientThatFallsTooFarBehindIsDropped() {
        FakeSession slow = connect("slow");
        slow.mode = FakeSession.Mode.DEFERRED;

        // одно сообщение «в полёте» и MAX_PENDING в очереди; следующее переполняет её
        for (int i = 0; i <= ClientConnection.MAX_PENDING + 1; i++) {
            broadcaster.broadcast("m" + i);
        }

        assertTrue(slow.closed);
        assertEquals(0, broadcaster.sessionCount());
    }

    @Test
    void unregisterIsIdempotent() {
        FakeSession a = connect("a");

        broadcaster.unregister(a.session);
        broadcaster.unregister(a.session);
        broadcaster.broadcast("m1");

        assertEquals(0, broadcaster.sessionCount());
        assertTrue(a.sent.isEmpty());
    }

    @Test
    void sendToTargetsOnlyThatSession() {
        FakeSession a = connect("a");
        FakeSession b = connect("b");

        broadcaster.sendTo(a.session, ChangeMessage.PONG);

        assertEquals(Collections.singletonList("pong"), a.sent);
        assertTrue(b.sent.isEmpty());
    }
}
