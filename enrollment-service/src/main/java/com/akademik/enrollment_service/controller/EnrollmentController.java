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

    // GET /health
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> res = new HashMap<>();
        res.put("service", "enrollment-service");
        res.put("status", "running");
        return ResponseEntity.ok(res);
    }

    // GET /enrollments
    @GetMapping("/enrollments")
    public ResponseEntity<?> getAll() {
        Map<String, Object> res = new HashMap<>();
        res.put("service", "enrollment-service");
        res.put("data", service.getAll());
        return ResponseEntity.ok(res);
    }

    // GET /enrollments/{id}
    @GetMapping("/enrollments/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return service.getById(id)
            .map(e -> {
                Map<String, Object> res = new HashMap<>();
                res.put("service", "enrollment-service");
                res.put("data", e);
                return ResponseEntity.ok(res);
            })
            .orElseGet(() -> {
                Map<String, Object> res = new HashMap<>();
                res.put("service", "enrollment-service");
                res.put("message", "Enrollment tidak ditemukan");
                return ResponseEntity.status(404).body(res);
            });
    }

    // GET /enrollments/student/{studentId}
    @GetMapping("/enrollments/student/{studentId}")
    public ResponseEntity<?> getByStudent(@PathVariable String studentId) {
        Map<String, Object> res = new HashMap<>();
        res.put("service", "enrollment-service");
        res.put("data", service.getByStudentId(studentId));
        return ResponseEntity.ok(res);
    }

    // GET /enrollments/course/{courseId}
    @GetMapping("/enrollments/course/{courseId}")
    public ResponseEntity<?> getByCourse(@PathVariable Long courseId) {
        Map<String, Object> res = new HashMap<>();
        res.put("service", "enrollment-service");
        res.put("data", service.getByCourseId(courseId));
        return ResponseEntity.ok(res);
    }

    // POST /enrollments
    @PostMapping("/enrollments")
    public ResponseEntity<?> create(@RequestBody Enrollment enrollment) {
        if (enrollment.getStudentId() == null || enrollment.getCourseId() == null
                || enrollment.getSemester() == null || enrollment.getTahunAkademik() == null) {
            Map<String, Object> res = new HashMap<>();
            res.put("service", "enrollment-service");
            res.put("message", "studentId, courseId, semester, tahunAkademik wajib diisi");
            return ResponseEntity.status(400).body(res);
        }
        Map<String, Object> res = new HashMap<>();
        res.put("service", "enrollment-service");
        res.put("message", "Enrollment berhasil ditambahkan");
        res.put("data", service.create(enrollment));
        return ResponseEntity.status(201).body(res);
    }

    // PUT /enrollments/{id}
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
            .orElseGet(() -> {
                Map<String, Object> res = new HashMap<>();
                res.put("service", "enrollment-service");
                res.put("message", "Enrollment tidak ditemukan");
                return ResponseEntity.status(404).body(res);
            });
    }

    // DELETE /enrollments/{id}
    @DeleteMapping("/enrollments/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Map<String, Object> res = new HashMap<>();
        if (service.delete(id)) {
            res.put("service", "enrollment-service");
            res.put("message", "Enrollment berhasil dihapus");
            return ResponseEntity.ok(res);
        }
        res.put("service", "enrollment-service");
        res.put("message", "Enrollment tidak ditemukan");
        return ResponseEntity.status(404).body(res);
    }
}