package ru.itmo.is.lab.rest;

import ru.itmo.is.lab.auth.SessionUser;
import ru.itmo.is.lab.dto.LoginRequest;
import ru.itmo.is.lab.dto.RegisterRequest;
import ru.itmo.is.lab.dto.UserDto;
import ru.itmo.is.lab.service.AuthService;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@RequestScoped
public class AuthResource {

    @Inject
    private AuthService authService;

    @Inject
    private RequestValidator requestValidator;

    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response register(RegisterRequest request, @Context HttpServletRequest http) {
        RegisterRequest valid = requestValidator.require(request);
        UserDto user = authService.register(valid.getUsername(), valid.getPassword());
        SessionUser.start(http, user.getUsername());
        return Response.status(Response.Status.CREATED).entity(user).build();
    }

    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    public UserDto login(LoginRequest request, @Context HttpServletRequest http) {
        LoginRequest valid = requestValidator.require(request);
        UserDto user = authService.authenticate(valid.getUsername(), valid.getPassword());
        SessionUser.start(http, user.getUsername());
        return user;
    }

    @POST
    @Path("/logout")
    public Response logout(@Context HttpServletRequest http) {
        SessionUser.end(http);
        return Response.noContent().build();
    }

    @GET
    @Path("/me")
    public UserDto me(@Context HttpServletRequest http) {
        String username = SessionUser.current(http);
        if (username == null) {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        }
        return new UserDto(username);
    }
}
