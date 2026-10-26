package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Builder
public record FacilitiesInfoResponse(
        @JsonProperty("participating")
        long participating,
        @JsonProperty("inProgress")
        long inProgress,
        @JsonProperty("totalManaged")
        long totalManaged,
        @JsonProperty("coverageRate")
        double coverageRate
) {}

