package ru.itmo.is.lab.repository;

import ru.itmo.is.lab.entity.Car;
import ru.itmo.is.lab.entity.Car_;
import ru.itmo.is.lab.entity.HumanBeing;
import ru.itmo.is.lab.entity.HumanBeing_;

import javax.enterprise.context.ApplicationScoped;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;
import java.util.List;

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

    public List<Car> findFree() {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Car> query = cb.createQuery(Car.class);
        Root<Car> car = query.from(Car.class);

        query.select(car)
                .where(cb.not(cb.exists(ownerSubquery(query, cb, car))));

        return em.createQuery(query).getResultList();
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

    private Subquery<HumanBeing> ownerSubquery(CriteriaQuery<?> query, CriteriaBuilder cb, Root<Car> car) {
        Subquery<HumanBeing> owners = query.subquery(HumanBeing.class);
        Root<HumanBeing> human = owners.from(HumanBeing.class);
        owners.select(human)
                .where(cb.equal(human.get(HumanBeing_.car), car));
        return owners;
    }
}
