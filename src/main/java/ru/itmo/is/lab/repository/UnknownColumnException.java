package ru.itmo.is.lab.repository;

public class UnknownColumnException extends IllegalArgumentException {
    public UnknownColumnException(String message) {
        super(message);
    }
}
