package ru.itmo.is.lab.dto;

import javax.validation.constraints.Size;

public class CreateCarRequest {

    @Size(max = 255, message = "Название машины — не длиннее 255 символов")
    private String name;

    private Boolean cool;

    public CreateCarRequest() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getCool() { return cool; }
    public void setCool(Boolean cool) { this.cool = cool; }
}
