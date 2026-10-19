package ru.itmo.is.lab.dto;

import ru.itmo.is.lab.entity.Mood;
import ru.itmo.is.lab.entity.WeaponType;

import java.time.LocalDate;

public class HumanBeingDto {

    private Long id;
    private String name;
    private CoordinatesDto coordinates;
    private LocalDate creationDate;
    private boolean realHero;
    private boolean hasToothpick;
    private CarDto car;
    private Mood mood;
    private Integer impactSpeed;
    private WeaponType weaponType;
    private Long version;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public CoordinatesDto getCoordinates() { return coordinates; }
    public void setCoordinates(CoordinatesDto coordinates) { this.coordinates = coordinates; }

    public LocalDate getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDate creationDate) { this.creationDate = creationDate; }

    public boolean isRealHero() { return realHero; }
    public void setRealHero(boolean realHero) { this.realHero = realHero; }

    public boolean isHasToothpick() { return hasToothpick; }
    public void setHasToothpick(boolean hasToothpick) { this.hasToothpick = hasToothpick; }

    public CarDto getCar() { return car; }
    public void setCar(CarDto car) { this.car = car; }

    public Mood getMood() { return mood; }
    public void setMood(Mood mood) { this.mood = mood; }

    public Integer getImpactSpeed() { return impactSpeed; }
    public void setImpactSpeed(Integer impactSpeed) { this.impactSpeed = impactSpeed; }

    public WeaponType getWeaponType() { return weaponType; }
    public void setWeaponType(WeaponType weaponType) { this.weaponType = weaponType; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
