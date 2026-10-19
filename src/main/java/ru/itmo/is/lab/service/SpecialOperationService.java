package ru.itmo.is.lab.service;

import ru.itmo.is.lab.dto.HumanBeingDto;
import ru.itmo.is.lab.event.ChangeType;
import ru.itmo.is.lab.event.DataChangedEvent;
import ru.itmo.is.lab.mapper.HumanBeingMapper;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Event;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@ApplicationScoped
public class SpecialOperationService {

    @PersistenceContext
    private EntityManager em;

    @Inject
    private HumanBeingMapper humanBeingMapper;

    @Inject
    private Event<DataChangedEvent> dataChangedEvent;

    @Transactional(Transactional.TxType.REQUIRED)
    public long sumImpactSpeed() {
        return ((Number) em.createNativeQuery("SELECT sum_impact_speed()").getSingleResult()).longValue();
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public double averageImpactSpeed() {
        return ((Number) em.createNativeQuery("SELECT avg_impact_speed()").getSingleResult()).doubleValue();
    }

    @Transactional(Transactional.TxType.REQUIRED)
    @SuppressWarnings("unchecked")
    public List<HumanBeingDto> findByNamePrefix(String prefix) {
        Objects.requireNonNull(prefix, "prefix не может быть null");
        return ((List<ru.itmo.is.lab.entity.HumanBeing>) em
                .createNativeQuery("SELECT * FROM find_by_name_prefix(?)", ru.itmo.is.lab.entity.HumanBeing.class)
                .setParameter(1, prefix)
                .getResultList())
                .stream()
                .map(humanBeingMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public int setAllMoodSorrow() {
        int affectedRows = executeBulkFunction("SELECT set_all_mood_sorrow()");
        publishBulkUpdate(affectedRows);
        return affectedRows;
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public int assignLadaKalina() {
        int affectedRows = executeBulkFunction("SELECT assign_lada_kalina()");
        publishBulkUpdate(affectedRows);
        return affectedRows;
    }

    private int executeBulkFunction(String sql) {
        em.flush();
        int affectedRows = ((Number) em.createNativeQuery(sql)
                .getSingleResult()).intValue();
        em.clear();
        return affectedRows;
    }

    private void publishBulkUpdate(int affectedRows) {
        if (affectedRows > 0) {
            dataChangedEvent.fire(new DataChangedEvent("HumanBeing", null, ChangeType.UPDATED));
        }
    }
}
