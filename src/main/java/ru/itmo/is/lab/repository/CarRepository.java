package ru.itmo.is.lab.repository;

import ru.itmo.is.lab.entity.Car;
import ru.itmo.is.lab.entity.Car_;
import ru.itmo.is.lab.entity.HumanBeing;
import ru.itmo.is.lab.entity.HumanBeing_;

import javax.enterprise.context.ApplicationScoped;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class CarRepository {

    @PersistenceContext
    private EntityManager em;

    public Car findById(Long id) {
        return em.find(Car.class, id);
    }

    public void persist(Car car) {
        em.persist(car);
    }

    /**
     * Страница машин, порядок — по возрастанию id (он же уникальный tiebreaker).
     * {@code freeOnly} оставляет только машины, на которые никто не ссылается.
     */
    public List<Car> findPage(int offset, int limit, boolean freeOnly) {
        Pagination.validate(offset, limit);

        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Car> query = cb.createQuery(Car.class);
        Root<Car> car = query.from(Car.class);

        query.select(car).orderBy(cb.asc(car.get(Car_.id)));
        if (freeOnly) {
            query.where(cb.not(cb.exists(ownerSubquery(query, cb, car))));
        }

        return em.createQuery(query)
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();
    }

    public long count(boolean freeOnly) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Long> query = cb.createQuery(Long.class);
        Root<Car> car = query.from(Car.class);

        query.select(cb.count(car));
        if (freeOnly) {
            query.where(cb.not(cb.exists(ownerSubquery(query, cb, car))));
        }

        return em.createQuery(query).getSingleResult();
    }

    public boolean isFree(Long id) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Long> query = cb.createQuery(Long.class);
        Root<Car> car = query.from(Car.class);

        query.select(cb.count(car))
                .where(
                        cb.equal(car.get(Car_.id), id),
                        cb.not(cb.exists(ownerSubquery(query, cb, car)))
                );

        return em.createQuery(query).getSingleResult() > 0;
    }

    /**
     * Владельцы указанных машин одним запросом (без N+1). Свободные машины в результат не попадают,
     * поэтому отсутствие машины в ответе и означает «свободна».
     */
    public List<CarOwner> findOwners(Collection<Long> carIds) {
        if (carIds == null || carIds.isEmpty()) {
            return Collections.emptyList();
        }
        return em.createQuery(ownerQuery(carIds)).getResultList().stream()
                .map(CarRepository::toCarOwner)
                .collect(Collectors.toList());
    }

    /** Владелец машины или {@code null}, если машина свободна (UNIQUE(car_id) гарантирует не более одного). */
    public CarOwner findOwner(Long carId) {
        return findOwners(Collections.singletonList(carId)).stream()
                .findFirst()
                .orElse(null);
    }

    private CriteriaQuery<Tuple> ownerQuery(Collection<Long> carIds) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Tuple> query = cb.createTupleQuery();
        Root<HumanBeing> human = query.from(HumanBeing.class);
        Join<HumanBeing, Car> car = human.join(HumanBeing_.car);

        query.multiselect(
                car.get(Car_.id).alias("carId"),
                human.get(HumanBeing_.id).alias("humanId"),
                human.get(HumanBeing_.name).alias("humanName"));
        query.where(car.get(Car_.id).in(carIds));
        return query;
    }

    private static CarOwner toCarOwner(Tuple row) {
        return new CarOwner(row.get("carId", Long.class),
                row.get("humanId", Long.class),
                row.get("humanName", String.class));
    }

    private Subquery<HumanBeing> ownerSubquery(CriteriaQuery<?> query, CriteriaBuilder cb, Root<Car> car) {
        Subquery<HumanBeing> owners = query.subquery(HumanBeing.class);
        Root<HumanBeing> human = owners.from(HumanBeing.class);
        owners.select(human)
                .where(cb.equal(human.get(HumanBeing_.car), car));
        return owners;
    }
}
