package ru.itmo.is.lab.rest.error;

import javax.validation.ConstraintViolationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

/** Нарушения Bean Validation → 400. Ближе к ConstraintViolationException, чем встроенный маппер RESTEasy. */
@Provider
public class ConstraintViolationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Override
    public Response toResponse(ConstraintViolationException e) {
        return ErrorResponses.toResponse(ErrorResponses.validation(e));
    }
}
