package ru.itmo.is.lab.dto;

/**
 * Машина в ответе REST: поля {@link CarDto} плюс владелец ({@code null}, если машина свободна).
 * Наследование, а не копия трёх полей: новое поле машины появляется в обоих представлениях само,
 * и JSON остаётся плоским — JSON-B сериализует унаследованные свойства наравне со своими
 * (сначала свойства родителя, затем свои, внутри каждого класса — по алфавиту).
 */
public class CarWithOwnerDto extends CarDto {

    private OwnerDto owner;

    public CarWithOwnerDto() {
    }

    public CarWithOwnerDto(CarDto car, OwnerDto owner) {
        super(car.getId(), car.getName(), car.getCool());
        this.owner = owner;
    }

    public OwnerDto getOwner() { return owner; }
    public void setOwner(OwnerDto owner) { this.owner = owner; }
}
