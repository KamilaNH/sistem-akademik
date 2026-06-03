package com.akademik.enrollment_service.repository;

import com.akademik.enrollment_service.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentId(String studentId);
    List<Enrollment> findByCourseId(Long courseId);
}