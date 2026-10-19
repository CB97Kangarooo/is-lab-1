package ru.itmo.is.lab.service;

import ru.itmo.is.lab.dto.CreateHumanBeingRequest;
import ru.itmo.is.lab.dto.HumanBeingDto;
import ru.itmo.is.lab.dto.Page;
import ru.itmo.is.lab.dto.UpdateHumanBeingRequest;
import ru.itmo.is.lab.entity.Car;
import ru.itmo.is.lab.entity.HumanBeing;
import ru.itmo.is.lab.event.ChangeType;
import ru.itmo.is.lab.event.DataChangedEvent;
import ru.itmo.is.lab.exception.CarNotAvailableException;
import ru.itmo.is.lab.exception.ResourceNotFoundException;
import ru.itmo.is.lab.mapper.HumanBeingMapper;
import ru.itmo.is.lab.repository.CarRepository;
import ru.itmo.is.lab.repository.HumanBeingRepository;
import ru.itmo.is.lab.repository.SortOrder;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Event;
import javax.inject.Inject;
import javax.persistence.OptimisticLockException;
import javax.transaction.Transactional;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@ApplicationScoped
public class HumanBeingService {

    @Inject
    private HumanBeingRepository humanBeingRepository;

    @Inject
    private CarRepository carRepository;

    @Inject
    private HumanBeingMapper humanBeingMapper;

    @Inject
    private Event<DataChangedEvent> dataChangedEvent;

    @Transactional(Transactional.TxType.REQUIRED)
    public Page<HumanBeingDto> getPage(int offset, int limit, String sortField,
                                       SortOrder sortOrder, Map<String, String> filters) {
        List<HumanBeing> humans = humanBeingRepository.findPage(offset, limit, sortField, sortOrder, filters);
        long total = humanBeingRepository.countAll(filters);
        List<HumanBeingDto> items = humans.stream()
                .map(humanBeingMapper::toDto)
                .collect(Collectors.toList());
        return new Page<>(items, total);
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public HumanBeingDto getById(Long id) {
        return humanBeingMapper.toDto(findHuman(id));
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public HumanBeingDto create(CreateHumanBeingRequest request) {
        Car car = resolveFreeCar(request.getCarId());
        HumanBeing human = humanBeingMapper.toEntity(request, car);
        humanBeingRepository.persist(human);
        dataChangedEvent.fire(new DataChangedEvent("HumanBeing", human.getId(), ChangeType.CREATED));
        return humanBeingMapper.toDto(human);
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public HumanBeingDto update(Long id, UpdateHumanBeingRequest request) {
        HumanBeing human = findHuman(id);
        if (!Objects.equals(request.getVersion(), human.getVersion())) {
            throw new OptimisticLockException("Версия героя с id " + id + " устарела");
        }

        updateCar(human, request.getCarId());
        humanBeingMapper.updateEntity(human, request);
        dataChangedEvent.fire(new DataChangedEvent("HumanBeing", human.getId(), ChangeType.UPDATED));
        return humanBeingMapper.toDto(human);
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public void delete(Long id) {
        HumanBeing human = findHuman(id);
        humanBeingRepository.remove(human);
        dataChangedEvent.fire(new DataChangedEvent("HumanBeing", id, ChangeType.DELETED));
    }

    private HumanBeing findHuman(Long id) {
        HumanBeing human = humanBeingRepository.findById(id);
        if (human == null) {
            throw new ResourceNotFoundException("Герой", id);
        }
        return human;
    }

    private Car resolveFreeCar(Long carId) {
        if (carId == null) {
            return null;
        }
        Car car = carRepository.findById(carId);
        if (car == null) {
            throw new ResourceNotFoundException("Машина", carId);
        }
        if (!carRepository.isFree(carId)) {
            throw new CarNotAvailableException(carId);
        }
        return car;
    }

    private void updateCar(HumanBeing human, Long requestedCarId) {
        Long currentCarId = human.getCar() == null ? null : human.getCar().getId();
        if (Objects.equals(currentCarId, requestedCarId)) {
            return;
        }
        if (requestedCarId == null) {
            human.setCar(null);
            return;
        }
        human.setCar(resolveFreeCar(requestedCarId));
    }
}
