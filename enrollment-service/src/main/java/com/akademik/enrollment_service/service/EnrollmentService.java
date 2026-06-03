package com.akademik.enrollment_service.service;

import com.akademik.enrollment_service.model.Enrollment;
import com.akademik.enrollment_service.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository repository;

    public List<Enrollment> getAll() {
        return repository.findAll();
    }

    public Optional<Enrollment> getById(Long id) {
        return repository.findById(id);
    }

    public List<Enrollment> getByStudentId(String studentId) {
        return repository.findByStudentId(studentId);
    }

    public List<Enrollment> getByCourseId(Long courseId) {
        return repository.findByCourseId(courseId);
    }

    public Enrollment create(Enrollment enrollment) {
        enrollment.setUpdatedAt(LocalDateTime.now());
        return repository.save(enrollment);
    }

    public Optional<Enrollment> update(Long id, Enrollment data) {
        return repository.findById(id).map(e -> {
            if (data.getStudentId() != null) e.setStudentId(data.getStudentId());
            if (data.getCourseId() != null) e.setCourseId(data.getCourseId());
            if (data.getSemester() != null) e.setSemester(data.getSemester());
            if (data.getTahunAkademik() != null) e.setTahunAkademik(data.getTahunAkademik());
            if (data.getStatus() != null) e.setStatus(data.getStatus());
            e.setUpdatedAt(LocalDateTime.now());
            return repository.save(e);
        });
    }

    public boolean delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}