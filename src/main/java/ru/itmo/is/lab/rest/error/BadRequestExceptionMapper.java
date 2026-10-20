package ru.itmo.is.lab.rest.error;

import ru.itmo.is.lab.exception.BadRequestException;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

/**
 * Неверный запрос &rarr; 400: разбор query-параметров в ресурсах, {@code UnknownColumnException}
 * и границы offset/limit из репозитория. Тексты этих исключений написаны для пользователя
 * на русском, поэтому попадают в ответ как есть. Непредвиденный
 * {@code IllegalArgumentException} сюда не попадает и обрабатывается как 500.
 */
@Provider
public class BadRequestExceptionMapper implements ExceptionMapper<BadRequestException> {

    @Override
    public Response toResponse(BadRequestException e) {
        return ErrorResponses.toResponse(ErrorResponses.badRequest(e.getMessage()));
    }
}
