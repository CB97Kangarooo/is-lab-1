package ru.itmo.is.lab.repository;

import ru.itmo.is.lab.entity.Car;
import ru.itmo.is.lab.entity.HumanBeing;
import ru.itmo.is.lab.entity.HumanBeing_;

import javax.enterprise.context.ApplicationScoped;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Expression;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;


@ApplicationScoped
public class HumanBeingRepository {

    @PersistenceContext
    private EntityManager em;

    public List<HumanBeing> findPage(int offset, int limit, String sortField,
                                     SortOrder sortOrder, Map<String, String> filters) {
        Pagination.validate(offset, limit);

        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<HumanBeing> cq = cb.createQuery(HumanBeing.class);
        Root<HumanBeing> root = cq.from(HumanBeing.class);
        Join<HumanBeing, Car> car = (Join<HumanBeing, Car>) root.fetch(HumanBeing_.car, JoinType.LEFT);

        cq.select(root)
                .where(buildPredicates(cb, root, car, filters))
                .orderBy(buildOrder(cb, root, car, sortField, sortOrder));

        return em.createQuery(cq)
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();
    }

    /**
     * Герои по списку id, порядок — по возрастанию id. Как и {@code findPage}, тянет {@code car}
     * fetch join'ом: иначе сборка DTO дала бы по запросу на каждого героя (N+1).
     */
    public List<HumanBeing> findAllByIds(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }

        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<HumanBeing> cq = cb.createQuery(HumanBeing.class);
        Root<HumanBeing> root = cq.from(HumanBeing.class);
        root.fetch(HumanBeing_.car, JoinType.LEFT);

        cq.select(root)
                .where(root.get(HumanBeing_.id).in(ids))
                .orderBy(cb.asc(root.get(HumanBeing_.id)));

        return em.createQuery(cq).getResultList();
    }

    public long countAll(Map<String, String> filters) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        Root<HumanBeing> root = cq.from(HumanBeing.class);
        Join<HumanBeing, Car> car = root.join(HumanBeing_.car, JoinType.LEFT);

        cq.select(cb.count(root))
                .where(buildPredicates(cb, root, car, filters));

        return em.createQuery(cq).getSingleResult();
    }

    private Predicate[] buildPredicates(CriteriaBuilder cb, Root<HumanBeing> root,
                                        Join<HumanBeing, Car> car, Map<String, String> filters) {
        List<Predicate> predicates = new ArrayList<>();
        if (filters != null) {
            for (Map.Entry<String, String> entry : filters.entrySet()) {
                String value = entry.getValue() == null ? "" : entry.getValue().trim();
                if (value.isEmpty()) {
                    continue;
                }
                Expression<?> column = HumanBeingColumns.forFilter(entry.getKey(), root, car);
                predicates.add(containsIgnoreCase(cb, column, value));
            }
        }
        return predicates.toArray(new Predicate[0]);
    }

    @SuppressWarnings("unchecked")
    private static Predicate containsIgnoreCase(CriteriaBuilder cb, Expression<?> column, String value) {
        Expression<String> text = String.class.equals(column.getJavaType())
                ? (Expression<String>) column
                : column.as(String.class);
        String pattern = "%" + escapeLike(value) + "%";
        return cb.like(cb.lower(text), cb.lower(cb.literal(pattern)), '\\');
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }

    private List<Order> buildOrder(CriteriaBuilder cb, Root<HumanBeing> root, Join<HumanBeing, Car> car,
                                   String sortField, SortOrder sortOrder) {
        List<Order> orders = new ArrayList<>();
        boolean sortById = "id".equals(sortField);
        if (sortField != null && !sortField.isBlank()) {
            Expression<?> column = HumanBeingColumns.forSort(sortField, root, car);
            orders.add(sortOrder == SortOrder.DESC ? cb.desc(column) : cb.asc(column));
        }
        if (!sortById) {
            orders.add(cb.asc(root.get(HumanBeing_.id)));
        }
        return orders;
    }

    public HumanBeing findById(Long id) {
        return em.find(HumanBeing.class, id);
    }

    public void persist(HumanBeing human) {
        em.persist(human);
    }

    public HumanBeing merge(HumanBeing human) {
        return em.merge(human);
    }

    public void remove(HumanBeing human) {
        em.remove(human);
    }

    /** Отправить изменения в БД сейчас, а не при commit: так становится известна новая {@code @Version}. */
    public void flush() {
        em.flush();
    }
}