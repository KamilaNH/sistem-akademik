package com.akademik.enrollment_service.controller;

import com.akademik.enrollment_service.model.Enrollment;
import com.akademik.enrollment_service.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class EnrollmentController {

    @Autowired
    private EnrollmentService service;

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> res = new HashMap<>();
        res.put("service", "enrollment-service");
        res.put("status", "running");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/enrollments")
    public ResponseEntity<?> getAll() {
        Map<String, Object> res = new HashMap<>();
        res.put("service", "enrollment-service");
        res.put("data", service.getAll());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/enrollments/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return service.getById(id)
            .map(e -> {
                Map<String, Object> res = new HashMap<>();
                res.put("service", "enrollment-service");
                res.put("data", e);
                return ResponseEntity.ok(res);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/enrollments/student/{studentId}")
    public ResponseEntity<?> getByStudent(@PathVariable String studentId) {
        Map<String, Object> res = new HashMap<>();
        res.put("service", "enrollment-service");
        res.put("data", service.getByStudentId(studentId));
        return ResponseEntity.ok(res);
    }

    @GetMapping("/enrollments/course/{courseId}")
    public ResponseEntity<?> getByCourse(@PathVariable Long courseId) {
        Map<String, Object> res = new HashMap<>();
        res.put("service", "enrollment-service");
        res.put("data", service.getByCourseId(courseId));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/enrollments")
    public ResponseEntity<?> create(@RequestBody Enrollment enrollment) {
        Map<String, Object> res = new HashMap<>();
        res.put("service", "enrollment-service");
        res.put("message", "Enrollment berhasil ditambahkan");
        res.put("data", service.create(enrollment));
        return ResponseEntity.status(201).body(res);
    }

    @PutMapping("/enrollments/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Enrollment data) {
        return service.update(id, data)
            .map(e -> {
                Map<String, Object> res = new HashMap<>();
                res.put("service", "enrollment-service");
                res.put("message", "Enrollment berhasil diperbarui");
                res.put("data", e);
                return ResponseEntity.ok(res);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/enrollments/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Map<String, Object> res = new HashMap<>();
        if (service.delete(id)) {
            res.put("service", "enrollment-service");
            res.put("message", "Enrollment berhasil dihapus");
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.notFound().build();
    }
}