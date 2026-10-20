package ru.itmo.is.lab.repository;

import ru.itmo.is.lab.exception.BadRequestException;

/**
 * Границы страницы, общие для всех репозиториев: предел один, сообщение об ошибке одно.
 * Проверка живёт в слое репозитория, потому что ограничение защищает БД, а не REST:
 * оно действует и при вызове сервиса не из ресурса.
 */
public final class Pagination {

    public static final int MAX_LIMIT = 100;

    private Pagination() {
    }

    public static void validate(int offset, int limit) {
        if (offset < 0) {
            throw new BadRequestException("offset должен быть >= 0");
        }
        if (limit < 1 || limit > MAX_LIMIT) {
            throw new BadRequestException("limit должен быть от 1 до " + MAX_LIMIT);
        }
    }
}
