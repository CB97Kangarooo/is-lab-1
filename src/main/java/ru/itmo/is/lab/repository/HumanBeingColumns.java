package ru.itmo.is.lab.repository;

import ru.itmo.is.lab.entity.Car;
import ru.itmo.is.lab.entity.Car_;
import ru.itmo.is.lab.entity.Coordinates_;
import ru.itmo.is.lab.entity.HumanBeing;
import ru.itmo.is.lab.entity.HumanBeing_;

import javax.persistence.criteria.Expression;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Root;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public final class HumanBeingColumns {

    @FunctionalInterface
    private interface PathResolver {
        Expression<?> resolve(Root<HumanBeing> root, Join<HumanBeing, Car> car);
    }

    private static final class Column {
        private final PathResolver resolver;
        private final boolean filterable;

        private Column(PathResolver resolver, boolean filterable) {
            this.resolver = resolver;
            this.filterable = filterable;
        }
    }

    private static final Map<String, Column> COLUMNS = new LinkedHashMap<>();

    static {
        register("id",            false, (r, c) -> r.get(HumanBeing_.id));
        register("name",          true,  (r, c) -> r.get(HumanBeing_.name));
        register("coordinates.x", false, (r, c) -> r.get(HumanBeing_.coordinates).get(Coordinates_.x));
        register("coordinates.y", false, (r, c) -> r.get(HumanBeing_.coordinates).get(Coordinates_.y));
        register("creationDate",  false, (r, c) -> r.get(HumanBeing_.creationDate));
        register("realHero",      false, (r, c) -> r.get(HumanBeing_.realHero));
        register("hasToothpick",  false, (r, c) -> r.get(HumanBeing_.hasToothpick));
        register("car.name",      true,  (r, c) -> c.get(Car_.name));
        register("car.cool",      false, (r, c) -> c.get(Car_.cool));
        register("mood",          true,  (r, c) -> r.get(HumanBeing_.mood));
        register("impactSpeed",   false, (r, c) -> r.get(HumanBeing_.impactSpeed));
        register("weaponType",    true,  (r, c) -> r.get(HumanBeing_.weaponType));
    }

    private HumanBeingColumns() {
    }

    private static void register(String name, boolean filterable, PathResolver resolver) {
        COLUMNS.put(name, new Column(resolver, filterable));
    }

    public static Expression<?> forSort(String name, Root<HumanBeing> root, Join<HumanBeing, Car> car) {
        return find(name).resolver.resolve(root, car);
    }

    public static Expression<?> forFilter(String name, Root<HumanBeing> root, Join<HumanBeing, Car> car) {
        Column column = find(name);
        if (!column.filterable) {
            throw new UnknownColumnException(
                    "Фильтрация по колонке '" + name + "' не поддерживается. Доступно: " + filterableNames());
        }
        return column.resolver.resolve(root, car);
    }

    public static Set<String> filterableNames() {
        return COLUMNS.entrySet().stream()
                .filter(e -> e.getValue().filterable)
                .map(Map.Entry::getKey)
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    private static Column find(String name) {
        Column column = name == null ? null : COLUMNS.get(name);
        if (column == null) {
            throw new UnknownColumnException(
                    "Неизвестная колонка '" + name + "'. Доступно: " + COLUMNS.keySet());
        }
        return column;
    }
}