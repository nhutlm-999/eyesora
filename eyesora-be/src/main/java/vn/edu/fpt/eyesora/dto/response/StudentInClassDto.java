package vn.edu.fpt.eyesora.dto.response;

import vn.edu.fpt.eyesora.entity.ClassEnrollment.EnrollmentStatus;
import vn.edu.fpt.eyesora.entity.Patient.Gender;

import java.time.LocalDate;

public record StudentInClassDto(
        String patientId,
        String patientName,
        LocalDate dob,
        Gender gender,
        String parentPhone,
        String className,
        String schoolYear,
        EnrollmentStatus status
) {}