package ru.itmo.is.lab.service;

import javax.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PingService {

    public String status() {
        return "ok";
    }
}
