package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;

@Builder
public record FacilitySummaryResponse(
        long totalExaminedStudents,
        double currentMyopiaRate,
        long totalAlertCases
){}