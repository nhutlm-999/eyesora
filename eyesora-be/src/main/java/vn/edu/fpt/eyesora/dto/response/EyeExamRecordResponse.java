package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;
import java.time.Instant;
import java.time.LocalDate;

@Builder
public record EyeExamRecordResponse(
        String examId,
        String campaignTitle,
        String patientName,
        String gender,
        String className,
        Integer grade,
        String schoolYear,
        String facilityName,
        String examinerName,
        LocalDate examDate,

        Float vaLeftWithoutGlasses,
        Float vaLeftOldGlasses,
        Float vaLeftPinhole,
        Float vaLeftWithGlasses,
        Float sphLeft,
        Float cylLeft,
        Integer axisLeft,
        String pdLeft,

        Float vaRightWithoutGlasses,
        Float vaRightOldGlasses,
        Float vaRightPinhole,
        Float vaRightWithGlasses,
        Float sphRight,
        Float cylRight,
        Integer axisRight,
        String pdRight,
        
        LocalDate followupDate,
        String severity
){}