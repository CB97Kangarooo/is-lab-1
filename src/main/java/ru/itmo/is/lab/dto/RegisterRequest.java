package ru.itmo.is.lab.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Введите имя")
    @Size(min = 3, max = 50, message = "Имя — от 3 до 50 символов")
    @Pattern(regexp = "[\\p{L}\\p{N}_.-]*", message = "Имя может содержать буквы, цифры и символы _ . -")
    private String username;

    @NotBlank(message = "Введите пароль")
    @Size(min = 6, max = 100, message = "Пароль — от 6 до 100 символов")
    private String password;

    public RegisterRequest() {
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
