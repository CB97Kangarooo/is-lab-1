package ru.itmo.is.lab.rest;

import ru.itmo.is.lab.dto.CreateHumanBeingRequest;
import ru.itmo.is.lab.dto.HumanBeingDto;
import ru.itmo.is.lab.dto.Page;
import ru.itmo.is.lab.dto.UpdateHumanBeingRequest;
import ru.itmo.is.lab.rest.dto.PageResponse;
import ru.itmo.is.lab.service.HumanBeingService;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

@Path("/human-beings")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequestScoped
public class HumanBeingResource {

    @Inject
    private HumanBeingService humanBeingService;

    @Inject
    private RequestValidator requestValidator;

    @GET
    public PageResponse<HumanBeingDto> list(@QueryParam("offset") String offsetParam,
                                            @QueryParam("limit") String limitParam,
                                            @QueryParam("sort") String sort,
                                            @QueryParam("order") String orderParam,
                                            @Context UriInfo uriInfo) {
        int offset = QueryParams.intValue("offset", offsetParam, 0);
        int limit = QueryParams.intValue("limit", limitParam, QueryParams.DEFAULT_LIMIT);
        Page<HumanBeingDto> page = humanBeingService.getPage(offset, limit, sort,
                QueryParams.order(orderParam), QueryParams.filters(uriInfo.getQueryParameters()));
        return PageResponse.of(page, offset, limit);
    }

    @GET
    @Path("/{id: [0-9]+}")
    public HumanBeingDto get(@PathParam("id") long id) {
        return humanBeingService.getById(id);
    }

    @POST
    public Response create(CreateHumanBeingRequest request, @Context UriInfo uriInfo) {
        HumanBeingDto created = humanBeingService.create(requestValidator.require(request));
        return Response.created(uriInfo.getAbsolutePathBuilder().path(String.valueOf(created.getId())).build())
                .entity(created)
                .build();
    }

    @PUT
    @Path("/{id: [0-9]+}")
    public HumanBeingDto update(@PathParam("id") long id, UpdateHumanBeingRequest request) {
        return humanBeingService.update(id, requestValidator.require(request));
    }

    @DELETE
    @Path("/{id: [0-9]+}")
    public Response delete(@PathParam("id") long id) {
        humanBeingService.delete(id);
        return Response.noContent().build();
    }
}
