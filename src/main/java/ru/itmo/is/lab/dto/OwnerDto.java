package ru.itmo.is.lab.dto;

public class OwnerDto {

    private Long id;
    private String name;

    public OwnerDto() {
    }

    public OwnerDto(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
