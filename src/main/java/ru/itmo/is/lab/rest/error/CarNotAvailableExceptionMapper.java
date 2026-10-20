package ru.itmo.is.lab.rest.error;

import ru.itmo.is.lab.exception.CarNotAvailableException;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

/** Машина уже занята → 409. */
@Provider
public class CarNotAvailableExceptionMapper implements ExceptionMapper<CarNotAvailableException> {

    @Override
    public Response toResponse(CarNotAvailableException e) {
        return ErrorResponses.toResponse(ErrorResponses.carNotAvailable(e.getMessage()));
    }
}
