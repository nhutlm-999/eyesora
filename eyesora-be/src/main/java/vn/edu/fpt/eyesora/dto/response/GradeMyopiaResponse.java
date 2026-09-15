package vn.edu.fpt.eyesora.dto.response;

import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Builder
public record GradeMyopiaResponse(
        @JsonProperty("gradeId")
        String gradeId,
        @JsonProperty("gradeName")
        String gradeName,
        @JsonProperty("totalExamined")
        long totalExamined,
        @JsonProperty("myopiaCount")
        long myopiaCount,
        @JsonProperty("myopiaRate")
        double myopiaRate,
        @JsonProperty("severityBreakdown")
        SeverityBreakdown severityBreakdown,
        @JsonProperty("alertCount")
        long alertCount
) {}
