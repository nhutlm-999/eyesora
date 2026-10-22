package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;
import java.time.LocalDate;

@Builder
public record OverduePatientResponse(
        String patientId,
        String patientName,
        LocalDate dob,
        String gender,
        String parentPhone,
        String className,
        String facilityId,
        String facilityName,
        LocalDate lastExamDate,
        long monthsSinceLastExam,   // Số tháng trôi qua kể từ lần khám cuối
        Float lastSphLeft,          // Độ cận mắt trái lần khám cuối
        Float lastSphRight          // Độ cận mắt phải lần khám cuối
) {}