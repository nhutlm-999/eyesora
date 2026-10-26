package vn.edu.fpt.eyesora.dto.response;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record FacilityAlertRecordResponse(
        String examId,
        String studentName,
        String gender,
        String className,
        Integer grade,
        String facilityName,
        Double sphLeft,
        Double sphRight,
        LocalDate examDate
){}