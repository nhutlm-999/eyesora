package vn.edu.fpt.eyesora.dto.response;

public record RecommendationEvidence(
        long count,
        long total,
        double rate,
        Double threshold
) {}
