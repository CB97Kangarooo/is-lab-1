package ru.itmo.is.lab.service;

import ru.itmo.is.lab.dto.CarWithOwnerDto;
import ru.itmo.is.lab.dto.OwnerDto;
import ru.itmo.is.lab.dto.CreateCarRequest;
import ru.itmo.is.lab.dto.Page;
import ru.itmo.is.lab.entity.Car;
import ru.itmo.is.lab.event.ChangeType;
import ru.itmo.is.lab.event.DataChangedEvent;
import ru.itmo.is.lab.exception.ResourceNotFoundException;
import ru.itmo.is.lab.mapper.CarMapper;
import ru.itmo.is.lab.repository.CarOwner;
import ru.itmo.is.lab.repository.CarRepository;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Event;
import javax.inject.Inject;
import javax.transaction.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@ApplicationScoped
public class CarService {

    @Inject
    private CarRepository carRepository;

    @Inject
    private CarMapper carMapper;

    @Inject
    private Event<DataChangedEvent> dataChangedEvent;

    /** Созданная машина всегда свободна: сослаться на неё ещё некому, поэтому {@code owner == null}. */
    @Transactional(Transactional.TxType.REQUIRED)
    public CarWithOwnerDto create(CreateCarRequest request) {
        Car car = carMapper.toEntity(request);
        carRepository.persist(car);
        dataChangedEvent.fire(new DataChangedEvent("Car", car.getId(), ChangeType.CREATED));
        return toDtoWithOwner(car, null);
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public Page<CarWithOwnerDto> getPage(int offset, int limit, boolean freeOnly) {
        List<Car> cars = carRepository.findPage(offset, limit, freeOnly);
        long total = carRepository.count(freeOnly);
        // При freeOnly владельцев спрашивать не у кого: свободная машина — та, у которой их нет.
        Map<Long, CarOwner> owners = freeOnly ? Collections.<Long, CarOwner>emptyMap() : ownersOf(cars);
        List<CarWithOwnerDto> items = cars.stream()
                .map(car -> toDtoWithOwner(car, owners.get(car.getId())))
                .collect(Collectors.toList());
        return new Page<>(items, total);
    }

    /** Владельцы только машин этой страницы: один запрос на страницу, а не на машину. */
    private Map<Long, CarOwner> ownersOf(List<Car> cars) {
        List<Long> carIds = cars.stream()
                .map(Car::getId)
                .collect(Collectors.toList());
        return carRepository.findOwners(carIds).stream()
                // Слияние на случай дубликата carId: UNIQUE(car_id) его исключает,
                // но без третьего аргумента toMap упал бы IllegalStateException, то есть 500.
                .collect(Collectors.toMap(CarOwner::getCarId, Function.identity(), (first, other) -> first));
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public CarWithOwnerDto getById(Long id) {
        Car car = carRepository.findById(id);
        if (car == null) {
            throw new ResourceNotFoundException("Машина", id);
        }
        return toDtoWithOwner(car, carRepository.findOwner(id));
    }

    private CarWithOwnerDto toDtoWithOwner(Car car, CarOwner owner) {
        OwnerDto ownerDto = owner == null ? null : new OwnerDto(owner.getHumanId(), owner.getHumanName());
        return new CarWithOwnerDto(carMapper.toDto(car), ownerDto);
    }
}
