package com.hospital.pharmacy.dto;

public class MedicineResponse {
    private Long id;
    private String name;
    private String code;
    private String category;
    private String manufacturer;
    private String description;
    private boolean active;

    public MedicineResponse() {
    }

    public MedicineResponse(Long id, String name, String code, String category, String manufacturer, String description, boolean active) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.category = category;
        this.manufacturer = manufacturer;
        this.description = description;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
