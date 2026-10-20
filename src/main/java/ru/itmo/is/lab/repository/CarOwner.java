package ru.itmo.is.lab.repository;

/**
 * Владелец машины: результат запроса «машина → герой», не сущность.
 */
public final class CarOwner {

    private final Long carId;
    private final Long humanId;
    private final String humanName;

    public CarOwner(Long carId, Long humanId, String humanName) {
        this.carId = carId;
        this.humanId = humanId;
        this.humanName = humanName;
    }

    public Long getCarId() { return carId; }
    public Long getHumanId() { return humanId; }
    public String getHumanName() { return humanName; }
}
