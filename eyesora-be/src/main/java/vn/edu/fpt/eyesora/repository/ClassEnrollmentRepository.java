package vn.edu.fpt.eyesora.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.eyesora.dto.response.StudentInClassDto;
import vn.edu.fpt.eyesora.entity.ClassEnrollment;

import java.util.List;

public interface ClassEnrollmentRepository extends JpaRepository<ClassEnrollment, String> {

    @Query("""
        SELECT StudentInClassDto(
            p.patientId,
            p.patientName,
            p.dob,
            p.gender,
            p.parentPhone,
            c.className,
            c.schoolYear,
            ce.status
        )
        FROM ClassEnrollment ce
        JOIN ce.patient p
        JOIN ce.classes c
        WHERE c.id = :classId 
          AND p.isDeleted = false 
          AND ce.status = 'ACTIVE'
    """)
    List<StudentInClassDto> findStudentsByClassId(@Param("classId") String classId);

    @Query(
            value = """
            SELECT ce FROM ClassEnrollment ce
            JOIN FETCH ce.patient p
            LEFT JOIN FETCH p.ward w
            LEFT JOIN FETCH p.facility f
            WHERE ce.classes.id = :classId
              AND p.isDeleted = false
              AND ce.status = :status
        """,
            countQuery = """
            SELECT COUNT(ce) FROM ClassEnrollment ce
            WHERE ce.classes.id = :classId
              AND ce.patient.isDeleted = false
              AND ce.status = :status
        """
    )
    Page<ClassEnrollment> findActiveEnrollmentsByClassId(
            @Param("classId") String classId,
            @Param("status") ClassEnrollment.EnrollmentStatus status,
            Pageable pageable
    );

    // Kiểm tra lớp có học sinh đang hoạt động hay không
    boolean existsByClasses_IdAndStatus(String classId, ClassEnrollment.EnrollmentStatus status);
}
