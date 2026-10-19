package ru.itmo.is.lab.dto;

import javax.validation.constraints.NotNull;

public class UpdateHumanBeingRequest extends CreateHumanBeingRequest {

    @NotNull(message = "Версия обязательна")
    private Long version;

    public UpdateHumanBeingRequest() {
    }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
