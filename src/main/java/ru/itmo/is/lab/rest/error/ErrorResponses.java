package ru.itmo.is.lab.rest.error;

import ru.itmo.is.lab.entity.Mood;
import ru.itmo.is.lab.entity.WeaponType;
import ru.itmo.is.lab.exception.BadRequestException;
import ru.itmo.is.lab.exception.CarNotAvailableException;
import ru.itmo.is.lab.exception.InvalidCredentialsException;
import ru.itmo.is.lab.exception.ResourceNotFoundException;
import ru.itmo.is.lab.exception.UsernameTakenException;
import ru.itmo.is.lab.rest.dto.ErrorResponse;

import javax.json.JsonException;
import javax.json.bind.JsonbException;
import javax.persistence.OptimisticLockException;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.ElementKind;
import javax.validation.Path;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.logging.Level;
import java.util.logging.Logger;

public final class ErrorResponses {

    private static final Logger LOGGER = Logger.getLogger(ErrorResponses.class.getName());

    private static final int MAX_CAUSE_DEPTH = 25;
    private static final String SQLSTATE_UNIQUE_VIOLATION = "23505";
    private static final String SQLSTATE_FOREIGN_KEY_VIOLATION = "23503";
    private static final String CAR_UNIQUE_CONSTRAINT = "uq_human_car";
    private static final String USERNAME_UNIQUE_CONSTRAINT = "uq_app_user_username";

    private static final Map<String, String> ENTITY_TO_DTO_FIELD = Collections.singletonMap("car", "carId");

    private ErrorResponses() {
    }

    public static final class ApiError {

        private final int status;
        private final ErrorResponse body;

        ApiError(int status, ErrorResponse body) {
            this.status = status;
            this.body = body;
        }

        public int getStatus() { return status; }
        public ErrorResponse getBody() { return body; }
    }

    public static Response toResponse(ApiError error) {
        return Response.status(error.status)
                .type(MediaType.APPLICATION_JSON_TYPE)
                .entity(error.body)
                .build();
    }

    static ApiError error(int status, String message) {
        return error(status, message, Collections.<String, String>emptyMap());
    }

    static ApiError error(int status, String message, Map<String, String> fieldErrors) {
        return new ApiError(status, new ErrorResponse(message, fieldErrors));
    }

    public static ApiError validation(ConstraintViolationException e) {
        Set<ConstraintViolation<?>> violations = e.getConstraintViolations();
        if (violations == null || violations.isEmpty()) {
            return error(400, "Некорректные данные запроса");
        }
        Map<String, TreeSet<String>> byField = new TreeMap<>();
        List<String> general = new ArrayList<>();
        for (ConstraintViolation<?> violation : violations) {
            String field = fieldKey(violation.getPropertyPath());
            if (field.isEmpty()) {
                general.add(violation.getMessage());
            } else {
                byField.computeIfAbsent(field, k -> new TreeSet<>()).add(violation.getMessage());
            }
        }
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        byField.forEach((field, messages) -> fieldErrors.put(field, String.join("; ", messages)));
        String message = general.isEmpty()
                ? "Некорректные данные: исправьте выделенные поля и повторите попытку"
                : String.join("; ", general);
        return error(400, message, fieldErrors);
    }

    static String fieldKey(Path path) {
        StringBuilder key = new StringBuilder();
        for (Path.Node node : path) {
            if (node.getKind() != ElementKind.PROPERTY || node.getName() == null) {
                continue;
            }
            if (key.length() > 0) {
                key.append('.');
            }
            key.append(node.getName());
        }
        String field = key.toString();
        return ENTITY_TO_DTO_FIELD.getOrDefault(field, field);
    }

    public static ApiError notFound(ResourceNotFoundException e) {
        return error(404, e.getMessage());
    }

    public static ApiError carNotAvailable(String message) {
        return error(409, message, Collections.singletonMap("carId", message));
    }

    public static ApiError usernameTaken(String message) {
        return error(409, message, Collections.singletonMap("username", message));
    }

    public static ApiError invalidCredentials(String message) {
        return error(401, message);
    }

    public static ApiError versionConflict() {
        return error(409, "Герой был изменён или удалён другим пользователем. "
                + "Обновите данные и повторите попытку.");
    }

    public static ApiError badRequest(String message) {
        return error(400, message == null || message.isEmpty() ? "Некорректный запрос" : message);
    }

    public static ApiError invalidBody() {
        return error(400, "Некорректное тело запроса: проверьте формат JSON и значения полей. "
                + "Допустимые значения mood: " + Arrays.toString(Mood.values())
                + ", weaponType: " + Arrays.toString(WeaponType.values()));
    }

    public static String messageForStatus(int status) {
        switch (status) {
            case 400: return "Некорректный запрос";
            case 401: return "Требуется аутентификация";
            case 403: return "Доступ запрещён";
            case 404: return "Ресурс не найден";
            case 405: return "Метод не поддерживается для этого адреса";
            case 406: return "Запрошенный формат ответа не поддерживается, используйте application/json";
            case 415: return "Неподдерживаемый тип содержимого, используйте application/json";
            default:
                return status >= 500 ? "Внутренняя ошибка сервера. Попробуйте позже." : "Ошибка запроса";
        }
    }

    public static ApiError resolve(Throwable error) {
        Throwable current = error;
        for (int depth = 0; current != null && depth < MAX_CAUSE_DEPTH; depth++) {
            ApiError known = fromKnown(current);
            if (known != null) {
                return known;
            }
            if (current.getCause() == current) {
                break;
            }
            current = current.getCause();
        }
        LOGGER.log(Level.SEVERE, "Необработанная ошибка при обработке запроса", error);
        return error(500, messageForStatus(500));
    }

    private static ApiError fromKnown(Throwable t) {
        if (t instanceof ConstraintViolationException) {
            return validation((ConstraintViolationException) t);
        }
        if (t instanceof BadRequestException) {
            return badRequest(t.getMessage());
        }
        if (t instanceof ResourceNotFoundException) {
            return notFound((ResourceNotFoundException) t);
        }
        if (t instanceof CarNotAvailableException) {
            return carNotAvailable(t.getMessage());
        }
        if (t instanceof UsernameTakenException) {
            return usernameTaken(t.getMessage());
        }
        if (t instanceof InvalidCredentialsException) {
            return invalidCredentials(t.getMessage());
        }
        if (t instanceof OptimisticLockException
                || hasClassNameInHierarchy(t, "org.hibernate.StaleStateException")) {
            return versionConflict();
        }
        if (t instanceof SQLException) {
            return fromSqlState((SQLException) t);
        }
        if (t instanceof JsonbException || t instanceof JsonException) {
            return invalidBody();
        }
        if (t instanceof WebApplicationException) {
            int status = ((WebApplicationException) t).getResponse().getStatus();
            return error(status, messageForStatus(status));
        }
        return null;
    }

    private static ApiError fromSqlState(SQLException e) {
        String state = e.getSQLState();
        if (SQLSTATE_UNIQUE_VIOLATION.equals(state)) {
            if (e.getMessage() != null && e.getMessage().contains(CAR_UNIQUE_CONSTRAINT)) {
                return carNotAvailable("Эта машина уже занята другим героем");
            }
            if (e.getMessage() != null && e.getMessage().contains(USERNAME_UNIQUE_CONSTRAINT)) {
                return usernameTaken("Это имя уже занято");
            }
            return error(409, "Запись нарушает ограничение уникальности");
        }
        if (SQLSTATE_FOREIGN_KEY_VIOLATION.equals(state)) {
            return error(409, "Связанный объект не найден или уже удалён. Обновите данные и повторите попытку.");
        }
        return null;
    }

    private static boolean hasClassNameInHierarchy(Throwable t, String className) {
        for (Class<?> c = t.getClass(); c != null; c = c.getSuperclass()) {
            if (className.equals(c.getName())) {
                return true;
            }
        }
        return false;
    }
}
