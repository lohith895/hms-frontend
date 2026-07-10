package com.hospital.laboratory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LaboratoryResultRequest {

    @NotBlank(message = "Result value is required")
    @Size(max = 255)
    private String resultValue;

    @Size(max = 1000)
    private String comments;

    public LaboratoryResultRequest() {
    }

    public LaboratoryResultRequest(String resultValue, String comments) {
        this.resultValue = resultValue;
        this.comments = comments;
    }

    public String getResultValue() {
        return resultValue;
    }

    public void setResultValue(String resultValue) {
        this.resultValue = resultValue;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
