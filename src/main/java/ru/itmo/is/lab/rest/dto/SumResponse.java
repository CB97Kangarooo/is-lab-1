package ru.itmo.is.lab.rest.dto;

public class SumResponse {

    private long value;

    public SumResponse() {
    }

    public SumResponse(long value) {
        this.value = value;
    }

    public long getValue() { return value; }
    public void setValue(long value) { this.value = value; }
}
