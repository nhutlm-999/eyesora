package vn.edu.fpt.eyesora.dto.response;

import java.util.List;

public record GradeAnalysisResponse(
    String highestGrade,
    double highestRate,
    String lowestGrade,
    double lowestRate,
    List<String> autoInsights
) {}
