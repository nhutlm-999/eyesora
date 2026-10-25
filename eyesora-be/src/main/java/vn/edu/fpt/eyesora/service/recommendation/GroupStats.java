package vn.edu.fpt.eyesora.service.recommendation;

import java.time.LocalDate;
import java.util.List;
import vn.edu.fpt.eyesora.entity.EyeExamRecord;

public record GroupStats(
        String name,
        long total,
        long myopic,
        long severe,
        long highAstigmatism,
        long overdue,
        long borderline
) {
    public static GroupStats of(String name, List<EyeExamRecord> rs,
                                ClinicalDefinitions d, LocalDate today) {
        return new GroupStats(
                name,
                rs.size(),
                rs.stream().filter(d::isMyopic).count(),
                rs.stream().filter(d::isSevereMyopia).count(),
                rs.stream().filter(d::isHighAstigmatism).count(),
                rs.stream().filter(r -> d.isOverdueFollowup(r, today)).count(),
                rs.stream().filter(d::isBorderlineMyopia).count()
        );
    }

    public double rate(long count) {
        return total == 0 ? 0.0 : Math.round(count * 1000.0 / total) / 10.0;
    }
}
