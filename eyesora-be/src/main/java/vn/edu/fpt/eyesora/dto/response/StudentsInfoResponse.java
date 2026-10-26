package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Builder
public record StudentsInfoResponse(
        @JsonProperty("examined")
        long examined,
        @JsonProperty("target")
        long target,
        @JsonProperty("completionRate")
        double completionRate
) {}

