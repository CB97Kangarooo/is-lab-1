package ru.itmo.is.lab.rest;

import ru.itmo.is.lab.exception.BadRequestException;
import ru.itmo.is.lab.repository.SortOrder;

import javax.ws.rs.core.MultivaluedMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Разбор query-параметров. Ошибки формата — {@link BadRequestException} (→ 400 с русским текстом):
 * иначе RESTEasy отвечает на нечисловой {@code @QueryParam int} ответом 404 с английским текстом.
 */
final class QueryParams {

    static final String FILTER_PREFIX = "filter.";

    /** Размер страницы, если клиент его не задал. Один для всех списков API. */
    static final int DEFAULT_LIMIT = 20;

    private QueryParams() {
    }

    static int intValue(String name, String raw, int defaultValue) {
        if (raw == null || raw.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException e) {
            throw new BadRequestException("Параметр " + name + " должен быть целым числом");
        }
    }

    static boolean booleanValue(String name, String raw, boolean defaultValue) {
        if (raw == null || raw.trim().isEmpty()) {
            return defaultValue;
        }
        String value = raw.trim();
        if ("true".equalsIgnoreCase(value)) {
            return true;
        }
        if ("false".equalsIgnoreCase(value)) {
            return false;
        }
        throw new BadRequestException("Параметр " + name + " должен быть true или false");
    }

    static SortOrder order(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return SortOrder.ASC;
        }
        try {
            return SortOrder.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            // valueOf бросает IllegalArgumentException — перехватываем узко, вокруг одного вызова.
            throw new BadRequestException("Параметр order должен быть asc или desc");
        }
    }

    /** {@code filter.car.name=lada} → {@code {"car.name": "lada"}}. Допустимость колонок проверяет репозиторий. */
    static Map<String, String> filters(MultivaluedMap<String, String> query) {
        Map<String, String> filters = new LinkedHashMap<>();
        for (String key : query.keySet()) {
            if (key.startsWith(FILTER_PREFIX)) {
                filters.put(key.substring(FILTER_PREFIX.length()), query.getFirst(key));
            }
        }
        return filters;
    }
}
