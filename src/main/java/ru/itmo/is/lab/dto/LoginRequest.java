package ru.itmo.is.lab.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class LoginRequest {

    @NotBlank(message = "Введите имя")
    @Size(max = 50, message = "Имя — не длиннее 50 символов")
    private String username;

    @NotBlank(message = "Введите пароль")
    @Size(max = 100, message = "Пароль — не длиннее 100 символов")
    private String password;

    public LoginRequest() {
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
