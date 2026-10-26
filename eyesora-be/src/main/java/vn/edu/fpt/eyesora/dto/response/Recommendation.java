package vn.edu.fpt.eyesora.dto.response;

import java.util.List;

public record Recommendation(
        String code,
        Priority priority,
        Audience audience,
        String scopeName,             // Tên nhóm hoặc "Gộp nhiều nhóm"
        String title,
        String reason,                // Phân tích chi tiết số liệu thống kê
        String action,                // Hành động vắn tắt chính (backward-compatible)
        RecommendationEvidence evidence,
        String listFilter,            // null nếu gộp nhiều nhóm
        List<ScopeStat> scopeBreakdown, // Thống kê chi tiết từng nhóm bị ảnh hưởng
        List<ActionItem> actionPlan,   // Danh sách giải pháp đa dạng phân tầng theo vai trò/thời gian
        List<String> statisticalInsights // Các insight số liệu sâu (độ lệch, xu hướng, phân vị)
) {
    public enum Priority { HIGH, MEDIUM, LOW }
    public enum Audience { SCHOOL_HEALTH, PARENT, SCHOOL_BOARD, HEALTH_DEPARTMENT }
}
