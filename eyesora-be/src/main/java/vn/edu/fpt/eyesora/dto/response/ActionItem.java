package vn.edu.fpt.eyesora.dto.response;

import java.util.List;

public record ActionItem(
        String role,       // ví dụ: "Y tế học đường", "Ban giám hiệu", "Phụ huynh"
        String action,     // hành động cụ thể
        String timeframe   // ví dụ: "Trong tuần", "Định kỳ 1 tháng", "Học kỳ này"
) {}
