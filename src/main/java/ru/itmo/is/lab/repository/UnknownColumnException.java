package ru.itmo.is.lab.repository;

import ru.itmo.is.lab.exception.BadRequestException;

/** Неизвестное или недопустимое имя колонки в sort/filter — ошибка запроса, а не сбой приложения. */
public class UnknownColumnException extends BadRequestException {
    public UnknownColumnException(String message) {
        super(message);
    }
}
