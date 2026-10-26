package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Builder
public record DashboardSummaryResponse(
        @JsonProperty("students")
        StudentsInfoResponse students,
        @JsonProperty("myopia")
        MyopiaInfoResponse myopia,
        @JsonProperty("criticalAlerts")
        CriticalAlertsResponse criticalAlerts,
        @JsonProperty("facilities")
        FacilitiesInfoResponse facilities
) {}
