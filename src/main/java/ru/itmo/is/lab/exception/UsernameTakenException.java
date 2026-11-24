package ru.itmo.is.lab.exception;

public class UsernameTakenException extends RuntimeException {

    public UsernameTakenException() {
        super("Это имя уже занято");
    }
}
