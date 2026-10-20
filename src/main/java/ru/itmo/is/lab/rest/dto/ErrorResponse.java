package ru.itmo.is.lab.rest.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Единый формат ошибки REST API: {@code {message, fieldErrors: {поле: сообщение}}}.
 */
public class ErrorResponse {

    private String message;
    private Map<String, String> fieldErrors = new LinkedHashMap<>();

    public ErrorResponse() {
    }

    public ErrorResponse(String message, Map<String, String> fieldErrors) {
        this.message = message;
        if (fieldErrors != null) {
            this.fieldErrors = new LinkedHashMap<>(fieldErrors);
        }
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, String> getFieldErrors() { return fieldErrors; }
    public void setFieldErrors(Map<String, String> fieldErrors) { this.fieldErrors = fieldErrors; }
}
