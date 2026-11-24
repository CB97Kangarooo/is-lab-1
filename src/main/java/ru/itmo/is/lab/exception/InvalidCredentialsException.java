package ru.itmo.is.lab.exception;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Неверное имя или пароль");
    }
}
