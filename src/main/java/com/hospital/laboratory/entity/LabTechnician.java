package com.hospital.laboratory.entity;

import com.hospital.users.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "lab_technicians")
public class LabTechnician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Size(max = 100)
    @Column(length = 100)
    private String specialization;

    @Size(max = 100)
    @Column(length = 100)
    private String certification;

    @Size(max = 20)
    @Column(length = 20)
    private String phone;

    public LabTechnician() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getCertification() { return certification; }
    public void setCertification(String certification) { this.certification = certification; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
