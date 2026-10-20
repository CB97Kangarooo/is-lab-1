package ru.itmo.is.lab.rest.error;

import ru.itmo.is.lab.exception.ResourceNotFoundException;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

/** Объект не найден → 404. */
@Provider
public class ResourceNotFoundExceptionMapper implements ExceptionMapper<ResourceNotFoundException> {

    @Override
    public Response toResponse(ResourceNotFoundException e) {
        return ErrorResponses.toResponse(ErrorResponses.notFound(e));
    }
}
