package ru.itmo.is.lab.rest;

import ru.itmo.is.lab.exception.BadRequestException;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.Validator;
import java.util.Set;

/**
 * Явная проверка входного DTO через Bean Validation.
 * Нарушения содержат пути относительно DTO ({@code name}, {@code coordinates.x}), поэтому
 * ключи {@code fieldErrors} совпадают с именами полей запроса.
 */
@ApplicationScoped
public class RequestValidator {

    @Inject
    private Validator validator;

    public <T> T require(T body) {
        if (body == null) {
            throw new BadRequestException("Тело запроса обязательно");
        }
        Set<ConstraintViolation<T>> violations = validator.validate(body);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        return body;
    }
}
