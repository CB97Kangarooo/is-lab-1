package ru.itmo.is.lab.auth;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

public final class SessionUser {

    private static final String ATTRIBUTE = "auth.username";

    private SessionUser() {
    }

    public static void start(HttpServletRequest request, String username) {
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        request.getSession(true).setAttribute(ATTRIBUTE, username);
    }

    public static String current(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session == null ? null : (String) session.getAttribute(ATTRIBUTE);
    }

    public static void end(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
}
