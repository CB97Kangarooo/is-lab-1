package ru.itmo.is.lab.rest;

import ru.itmo.is.lab.rest.dto.PingResponse;
import ru.itmo.is.lab.service.PingService;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/ping")
@RequestScoped
public class PingResource {

    @Inject
    private PingService pingService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public PingResponse ping() {
        return new PingResponse(pingService.status());
    }
}
