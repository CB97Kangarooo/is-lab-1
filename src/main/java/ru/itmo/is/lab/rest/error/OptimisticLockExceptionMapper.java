package ru.itmo.is.lab.rest.error;

import javax.persistence.OptimisticLockException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

/** Конфликт версий (@Version) → 409. */
@Provider
public class OptimisticLockExceptionMapper implements ExceptionMapper<OptimisticLockException> {

    @Override
    public Response toResponse(OptimisticLockException e) {
        return ErrorResponses.toResponse(ErrorResponses.versionConflict());
    }
}
