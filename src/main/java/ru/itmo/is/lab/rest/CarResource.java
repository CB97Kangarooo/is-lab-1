package ru.itmo.is.lab.rest;

import ru.itmo.is.lab.dto.CarWithOwnerDto;
import ru.itmo.is.lab.dto.CreateCarRequest;
import ru.itmo.is.lab.dto.Page;
import ru.itmo.is.lab.rest.dto.PageResponse;
import ru.itmo.is.lab.service.CarService;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

@Path("/cars")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequestScoped
public class CarResource {

    @Inject
    private CarService carService;

    @Inject
    private RequestValidator requestValidator;

    @GET
    public PageResponse<CarWithOwnerDto> list(@QueryParam("offset") String offsetParam,
                                              @QueryParam("limit") String limitParam,
                                              @QueryParam("free") String freeParam) {
        int offset = QueryParams.intValue("offset", offsetParam, 0);
        int limit = QueryParams.intValue("limit", limitParam, QueryParams.DEFAULT_LIMIT);
        Page<CarWithOwnerDto> page = carService.getPage(offset, limit,
                QueryParams.booleanValue("free", freeParam, false));
        return PageResponse.of(page, offset, limit);
    }

    @GET
    @Path("/{id: [0-9]+}")
    public CarWithOwnerDto get(@PathParam("id") long id) {
        return carService.getById(id);
    }

    @POST
    public Response create(CreateCarRequest request, @Context UriInfo uriInfo) {
        CarWithOwnerDto created = carService.create(requestValidator.require(request));
        return Response.created(uriInfo.getAbsolutePathBuilder().path(String.valueOf(created.getId())).build())
                .entity(created)
                .build();
    }
}
