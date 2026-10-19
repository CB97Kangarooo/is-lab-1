package ru.itmo.is.lab.mapper;

import ru.itmo.is.lab.dto.CoordinatesDto;
import ru.itmo.is.lab.dto.CoordinatesRequest;
import ru.itmo.is.lab.dto.CreateHumanBeingRequest;
import ru.itmo.is.lab.dto.HumanBeingDto;
import ru.itmo.is.lab.dto.UpdateHumanBeingRequest;
import ru.itmo.is.lab.entity.Car;
import ru.itmo.is.lab.entity.Coordinates;
import ru.itmo.is.lab.entity.HumanBeing;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

@ApplicationScoped
public class HumanBeingMapper {

    @Inject
    private CarMapper carMapper;

    public HumanBeing toEntity(CreateHumanBeingRequest request, Car car) {
        HumanBeing human = new HumanBeing();
        copyFields(human, request);
        human.setCar(car);
        return human;
    }

    public void updateEntity(HumanBeing human, UpdateHumanBeingRequest request) {
        copyFields(human, request);
    }

    public HumanBeingDto toDto(HumanBeing human) {
        HumanBeingDto dto = new HumanBeingDto();
        dto.setId(human.getId());
        dto.setName(human.getName());
        dto.setCoordinates(toDto(human.getCoordinates()));
        dto.setCreationDate(human.getCreationDate());
        dto.setRealHero(human.isRealHero());
        dto.setHasToothpick(human.isHasToothpick());
        dto.setCar(carMapper.toDto(human.getCar()));
        dto.setMood(human.getMood());
        dto.setImpactSpeed(human.getImpactSpeed());
        dto.setWeaponType(human.getWeaponType());
        dto.setVersion(human.getVersion());
        return dto;
    }

    private void copyFields(HumanBeing human, CreateHumanBeingRequest request) {
        human.setName(request.getName());
        human.setCoordinates(toEntity(request.getCoordinates()));
        human.setRealHero(request.isRealHero());
        human.setHasToothpick(request.isHasToothpick());
        human.setMood(request.getMood());
        human.setImpactSpeed(request.getImpactSpeed());
        human.setWeaponType(request.getWeaponType());
    }

    private Coordinates toEntity(CoordinatesRequest request) {
        return new Coordinates(request.getX(), request.getY());
    }

    private CoordinatesDto toDto(Coordinates coordinates) {
        return new CoordinatesDto(coordinates.getX(), coordinates.getY());
    }
}
