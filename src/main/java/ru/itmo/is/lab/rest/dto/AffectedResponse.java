package ru.itmo.is.lab.rest.dto;

/**
 * Результат массовой операции: сколько записей затронуто.
 */
public class AffectedResponse {

    private int affected;

    public AffectedResponse() {
    }

    public AffectedResponse(int affected) {
        this.affected = affected;
    }

    public int getAffected() { return affected; }
    public void setAffected(int affected) { this.affected = affected; }
}
