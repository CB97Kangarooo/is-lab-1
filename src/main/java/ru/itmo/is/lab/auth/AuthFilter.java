package ru.itmo.is.lab.auth;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@WebFilter(urlPatterns = "/api/*")
public class AuthFilter implements Filter {

    private static final String PUBLIC_PREFIX = "/api/auth/";
    private static final String UNAUTHORIZED_BODY = "{\"message\":\"Требуется вход в систему\",\"fieldErrors\":{}}";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        String path = request.getRequestURI().substring(request.getContextPath().length());

        if (path.startsWith(PUBLIC_PREFIX) || SessionUser.current(request) != null) {
            chain.doFilter(req, res);
            return;
        }
        HttpServletResponse response = (HttpServletResponse) res;
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        if (wantsHtml(request)) {
            response.setContentType("text/html");
            response.getWriter().write("<!doctype html><meta charset=\"utf-8\"><title>Требуется вход</title>"
                    + "<p>Требуется вход в систему. <a href=\"" + request.getContextPath() + "/\">Перейти ко входу</a></p>");
            return;
        }
        response.setContentType("application/json");
        response.getWriter().write(UNAUTHORIZED_BODY);
    }

    private static boolean wantsHtml(HttpServletRequest request) {
        String accept = request.getHeader("Accept");
        return accept != null && accept.contains("text/html");
    }
}
