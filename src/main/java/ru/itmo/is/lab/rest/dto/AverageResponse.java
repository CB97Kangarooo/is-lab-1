package ru.itmo.is.lab.rest.dto;

/**
 * Среднее значение; {@code value == null}, если героев нет.
 */
public class AverageResponse {

    private Double value;

    public AverageResponse() {
    }

    public AverageResponse(Double value) {
        this.value = value;
    }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
}
