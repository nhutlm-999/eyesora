package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Builder
public record CriticalAlertsResponse(
        @JsonProperty("totalCases")
        long totalCases,
        @JsonProperty("severeMyopiaCount")
        long severeMyopiaCount,
        @JsonProperty("highAstigmatismCount")
        long highAstigmatismCount,
        @JsonProperty("pendingActionCount")
        long pendingActionCount
) {}

