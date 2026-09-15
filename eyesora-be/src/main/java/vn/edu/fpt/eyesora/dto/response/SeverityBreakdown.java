package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Builder
public record SeverityBreakdown(
        @JsonProperty("mild")
        long mild,
        @JsonProperty("moderate")
        long moderate,
        @JsonProperty("severe")
        long severe
) {}

