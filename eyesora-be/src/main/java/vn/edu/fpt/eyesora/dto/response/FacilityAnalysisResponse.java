package vn.edu.fpt.eyesora.dto.response;

import java.util.List;

public record FacilityAnalysisResponse(
    List<FacilityRankDto> rankings,
    List<String> autoInsights
) {}
