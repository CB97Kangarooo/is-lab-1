package ru.itmo.is.lab.service;

import ru.itmo.is.lab.dto.CarDto;
import ru.itmo.is.lab.dto.CreateCarRequest;
import ru.itmo.is.lab.entity.Car;
import ru.itmo.is.lab.event.ChangeType;
import ru.itmo.is.lab.event.DataChangedEvent;
import ru.itmo.is.lab.mapper.CarMapper;
import ru.itmo.is.lab.repository.CarRepository;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Event;
import javax.inject.Inject;
import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class CarService {

    @Inject
    private CarRepository carRepository;

    @Inject
    private CarMapper carMapper;

    @Inject
    private Event<DataChangedEvent> dataChangedEvent;

    @Transactional(Transactional.TxType.REQUIRED)
    public CarDto create(CreateCarRequest request) {
        Car car = carMapper.toEntity(request);
        carRepository.persist(car);
        dataChangedEvent.fire(new DataChangedEvent("Car", car.getId(), ChangeType.CREATED));
        return carMapper.toDto(car);
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public List<CarDto> getFreeCars() {
        return carRepository.findFree().stream()
                .map(carMapper::toDto)
                .collect(Collectors.toList());
    }
}
