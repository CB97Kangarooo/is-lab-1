package ru.itmo.is.lab.rest.dto;

public class PingResponse {

    private String status;

    public PingResponse() {
    }

    public PingResponse(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
