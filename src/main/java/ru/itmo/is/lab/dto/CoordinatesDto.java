package ru.itmo.is.lab.dto;

public class CoordinatesDto {

    private Double x;
    private double y;

    public CoordinatesDto() {
    }

    public CoordinatesDto(Double x, double y) {
        this.x = x;
        this.y = y;
    }

    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
}
