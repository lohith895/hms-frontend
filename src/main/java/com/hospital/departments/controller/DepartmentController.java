package com.hospital.departments.controller;

import com.hospital.departments.entity.Department;
import com.hospital.departments.repository.DepartmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping("/public")
    public ResponseEntity<List<Department>> getPublicDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }
}
