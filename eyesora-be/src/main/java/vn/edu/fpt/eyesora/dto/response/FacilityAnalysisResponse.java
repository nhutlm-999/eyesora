package vn.edu.fpt.eyesora.dto.response;

import java.util.List;

public record FacilityAnalysisResponse(
        List<FacilityRankDto> rankings,
        double averageRate,
        @Deprecated List<String> autoInsights,
        List<Recommendation> recommendations
) {}
