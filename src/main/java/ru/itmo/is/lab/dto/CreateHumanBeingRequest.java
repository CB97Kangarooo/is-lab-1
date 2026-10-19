package ru.itmo.is.lab.dto;

import ru.itmo.is.lab.entity.Mood;
import ru.itmo.is.lab.entity.WeaponType;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class CreateHumanBeingRequest {

    @NotBlank(message = "Имя не может быть пустым")
    @Size(max = 255, message = "Имя — не длиннее 255 символов")
    private String name;

    @NotNull(message = "Координаты обязательны")
    @Valid
    private CoordinatesRequest coordinates;

    private boolean realHero;
    private boolean hasToothpick;
    private Long carId;

    @NotNull(message = "Настроение обязательно")
    private Mood mood;

    @NotNull(message = "Скорость удара обязательна")
    @Max(value = 213, message = "Скорость удара не может быть больше 213")
    private Integer impactSpeed;

    private WeaponType weaponType;

    public CreateHumanBeingRequest() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public CoordinatesRequest getCoordinates() { return coordinates; }
    public void setCoordinates(CoordinatesRequest coordinates) { this.coordinates = coordinates; }

    public boolean isRealHero() { return realHero; }
    public void setRealHero(boolean realHero) { this.realHero = realHero; }

    public boolean isHasToothpick() { return hasToothpick; }
    public void setHasToothpick(boolean hasToothpick) { this.hasToothpick = hasToothpick; }

    public Long getCarId() { return carId; }
    public void setCarId(Long carId) { this.carId = carId; }

    public Mood getMood() { return mood; }
    public void setMood(Mood mood) { this.mood = mood; }

    public Integer getImpactSpeed() { return impactSpeed; }
    public void setImpactSpeed(Integer impactSpeed) { this.impactSpeed = impactSpeed; }

    public WeaponType getWeaponType() { return weaponType; }
    public void setWeaponType(WeaponType weaponType) { this.weaponType = weaponType; }
}
