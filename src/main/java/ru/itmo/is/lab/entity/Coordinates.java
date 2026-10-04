package ru.itmo.is.lab.entity;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.NotNull;

/**
 * Не сущность: своей таблицы и id нет, поля лежат колонками x, y в human_being.
 */
@Embeddable
public class Coordinates {

    @NotNull(message = "Координата X обязательна")
    @Column(name = "x", nullable = false)
    private Double x;

    @DecimalMax(value = "119", message = "Координата Y не может быть больше 119")
    @Column(name = "y", nullable = false)
    private double y;

    public Coordinates() {
    }

    public Coordinates(Double x, double y) {
        this.x = x;
        this.y = y;
    }

    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
}
