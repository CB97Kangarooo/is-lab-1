package ru.itmo.is.lab.exception;

public class CarNotAvailableException extends RuntimeException {

    public CarNotAvailableException(Long id) {
        super("Машина с id " + id + " уже занята");
    }
}
