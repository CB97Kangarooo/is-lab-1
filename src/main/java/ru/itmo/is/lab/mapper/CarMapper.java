package ru.itmo.is.lab.mapper;

import ru.itmo.is.lab.dto.CarDto;
import ru.itmo.is.lab.dto.CreateCarRequest;
import ru.itmo.is.lab.entity.Car;

import javax.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CarMapper {

    public Car toEntity(CreateCarRequest request) {
        return new Car(request.getName(), request.getCool());
    }

    public CarDto toDto(Car car) {
        if (car == null) {
            return null;
        }
        return new CarDto(car.getId(), car.getName(), car.getCool());
    }
}
