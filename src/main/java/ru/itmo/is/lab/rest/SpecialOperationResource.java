package ru.itmo.is.lab.rest;

import ru.itmo.is.lab.dto.HumanBeingDto;
import ru.itmo.is.lab.exception.BadRequestException;
import ru.itmo.is.lab.rest.dto.AffectedResponse;
import ru.itmo.is.lab.rest.dto.AverageResponse;
import ru.itmo.is.lab.rest.dto.SumResponse;
import ru.itmo.is.lab.service.SpecialOperationService;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import java.util.List;

@Path("/special")
@Produces(MediaType.APPLICATION_JSON)
@RequestScoped
public class SpecialOperationResource {

    @Inject
    private SpecialOperationService specialOperationService;

    @GET
    @Path("/impact-speed/sum")
    public SumResponse sumImpactSpeed() {
        return new SumResponse(specialOperationService.sumImpactSpeed());
    }

    @GET
    @Path("/impact-speed/average")
    public AverageResponse averageImpactSpeed() {
        return new AverageResponse(specialOperationService.averageImpactSpeed());
    }

    @GET
    @Path("/human-beings")
    public List<HumanBeingDto> findByNamePrefix(@QueryParam("prefix") String prefix) {
        if (prefix == null) {
            throw new BadRequestException("Параметр prefix обязателен");
        }
        return specialOperationService.findByNamePrefix(prefix);
    }

    @POST
    @Path("/mood/sorrow")
    public AffectedResponse setAllMoodSorrow() {
        return new AffectedResponse(specialOperationService.setAllMoodSorrow());
    }

    @POST
    @Path("/cars/lada-kalina")
    public AffectedResponse assignLadaKalina() {
        return new AffectedResponse(specialOperationService.assignLadaKalina());
    }
}
