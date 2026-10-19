package ru.itmo.is.lab.dto;

import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.NotNull;

public class CoordinatesRequest {

    @NotNull(message = "Координата X обязательна")
    private Double x;

    @DecimalMax(value = "119", message = "Координата Y не может быть больше 119")
    private double y;

    public CoordinatesRequest() {
    }

    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
}
