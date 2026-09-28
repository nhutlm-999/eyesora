package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;

@Builder
public record MyopiaTimelineResponse(
        java.time.LocalDate date,
        long mildCount,
        long moderateCount,
        long severeCount
){}