package com.hospital.doctors.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "schedules")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @NotBlank
    @Size(max = 20)
    @Column(name = "day_of_week", nullable = false, length = 20)
    private String dayOfWeek; // e.g. MONDAY, TUESDAY...

    @NotBlank
    @Size(max = 10)
    @Column(name = "start_time", nullable = false, length = 10)
    private String startTime; // HH:mm format

    @NotBlank
    @Size(max = 10)
    @Column(name = "end_time", nullable = false, length = 10)
    private String endTime; // HH:mm format

    @NotNull
    @Column(name = "max_patients", nullable = false)
    private Integer maxPatients;

    // Constructors
    public Schedule() {
    }

    public Schedule(Doctor doctor, String dayOfWeek, String startTime, String endTime, Integer maxPatients) {
        this.doctor = doctor;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.maxPatients = maxPatients;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Integer getMaxPatients() {
        return maxPatients;
    }

    public void setMaxPatients(Integer maxPatients) {
        this.maxPatients = maxPatients;
    }
}
