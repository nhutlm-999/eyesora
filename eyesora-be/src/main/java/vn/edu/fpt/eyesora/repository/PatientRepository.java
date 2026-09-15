package vn.edu.fpt.eyesora.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.eyesora.entity.Patient;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, String>, JpaSpecificationExecutor<Patient> {

    // 1. Fetch facility hoặc ward thay vì classes (nếu cần giảm N+1)
    @Override
    @EntityGraph(attributePaths = {"facility", "ward"})
    Page<Patient> findAll(Specification<Patient> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"facility", "ward"})
    Optional<Patient> findByPatientId(String patientId);

    // 2. Kiểm tra trùng học sinh theo lớp: JOIN qua enrollments và classes
    @Query("""
        SELECT p FROM Patient p
        JOIN p.enrollments ce
        WHERE p.patientName = :name
          AND p.gender = :gender
          AND ce.classes.id = :classId
          AND ce.status = 'ACTIVE'
          AND p.isDeleted = false
    """)
    Optional<Patient> findByPatientNameAndGenderAndClassId(
            @Param("name") String patientName,
            @Param("gender") Patient.Gender gender,
            @Param("classId") String classId
    );
}