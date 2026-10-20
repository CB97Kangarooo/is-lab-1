package ru.itmo.is.lab.exception;

/**
 * Запрос составлен неверно: нечитаемый параметр, недопустимый offset/limit, отсутствующее тело.
 * Отдельный тип, а не {@link IllegalArgumentException}: от последнего наследуются
 * {@code NumberFormatException} и исключение {@code Enum.valueOf}, поэтому маппер на
 * {@code IllegalArgumentException} превращал бы внутреннюю ошибку в 400 с техническим текстом.
 * Сообщение этого исключения адресовано пользователю и уходит в тело ответа.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
