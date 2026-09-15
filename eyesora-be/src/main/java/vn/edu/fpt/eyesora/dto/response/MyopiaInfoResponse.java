package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Builder
public record MyopiaInfoResponse(
        @JsonProperty("currentRate")
        double currentRate,
        @JsonProperty("trendComparison")
        TrendComparisonResponse trendComparison
) {}

