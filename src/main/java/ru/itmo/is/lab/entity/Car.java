package ru.itmo.is.lab.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.Size;

@Entity
@Table(name = "car")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 255, message = "Название машины — не длиннее 255 символов")
    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "cool")
    private Boolean cool;

    public Car() {
    }

    public Car(String name, Boolean cool) {
        this.name = name;
        this.cool = cool;
    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getCool() { return cool; }
    public void setCool(Boolean cool) { this.cool = cool; }
}
