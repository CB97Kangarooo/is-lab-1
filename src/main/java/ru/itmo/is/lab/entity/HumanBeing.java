package ru.itmo.is.lab.entity;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import javax.persistence.Version;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "human_being")
public class HumanBeing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @NotBlank(message = "Имя не может быть пустым")
    @Size(max = 255, message = "Имя — не длиннее 255 символов")
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @NotNull(message = "Координаты обязательны")
    @Valid
    @Embedded
    private Coordinates coordinates;

    @NotNull
    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDate creationDate;

    @Column(name = "real_hero", nullable = false)
    private boolean realHero;

    @Column(name = "has_toothpick", nullable = false)
    private boolean hasToothpick;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JoinColumn(name = "car_id", unique = true)
    private Car car;

    @NotNull(message = "Настроение обязательно")
    @Enumerated(EnumType.STRING)
    @Column(name = "mood", nullable = false, length = 16)
    private Mood mood;

    @NotNull(message = "Скорость удара обязательна")
    @Max(value = 213, message = "Скорость удара не может быть больше 213")
    @Column(name = "impact_speed", nullable = false)
    private Integer impactSpeed;

    @Enumerated(EnumType.STRING)
    @Column(name = "weapon_type", length = 16)
    private WeaponType weaponType;

    public HumanBeing() {
    }

    @PrePersist
    private void onCreate() {
        this.creationDate = LocalDate.now();
    }

    public Long getId() { return id; }

    public Long getVersion() { return version; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Coordinates getCoordinates() { return coordinates; }
    public void setCoordinates(Coordinates coordinates) { this.coordinates = coordinates; }

    public LocalDate getCreationDate() { return creationDate; }

    public boolean isRealHero() { return realHero; }
    public void setRealHero(boolean realHero) { this.realHero = realHero; }

    public boolean isHasToothpick() { return hasToothpick; }
    public void setHasToothpick(boolean hasToothpick) { this.hasToothpick = hasToothpick; }

    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }

    public Mood getMood() { return mood; }
    public void setMood(Mood mood) { this.mood = mood; }

    public Integer getImpactSpeed() { return impactSpeed; }
    public void setImpactSpeed(Integer impactSpeed) { this.impactSpeed = impactSpeed; }

    public WeaponType getWeaponType() { return weaponType; }
    public void setWeaponType(WeaponType weaponType) { this.weaponType = weaponType; }
}
