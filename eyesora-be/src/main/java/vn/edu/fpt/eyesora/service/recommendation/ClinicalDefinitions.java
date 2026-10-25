package vn.edu.fpt.eyesora.service.recommendation;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import vn.edu.fpt.eyesora.config.RecommendationProperties;
import vn.edu.fpt.eyesora.entity.EyeExamRecord;

@Component
@RequiredArgsConstructor
public class ClinicalDefinitions {
    private final RecommendationProperties props;

    public boolean isMyopic(EyeExamRecord r) {
        return neg(r.getSphLeft(), 0f) || neg(r.getSphRight(), 0f);
    }

    /** Cận nặng: SPH <= ngưỡng ở ít nhất một mắt (mặc định <= -6.00D). */
    public boolean isSevereMyopia(EyeExamRecord r) {
        float t = props.getSevereMyopiaSph();
        return le(r.getSphLeft(), t) || le(r.getSphRight(), t);
    }

    /** Ngưỡng ranh giới cận trung bình: [-3.00D, -2.50D] */
    public boolean isBorderlineMyopia(EyeExamRecord r) {
        return inRange(r.getSphLeft()) || inRange(r.getSphRight());
    }

    /** Loạn thị cao: |CYL| >= ngưỡng (mặc định >= 1.50D) */
    public boolean isHighAstigmatism(EyeExamRecord r) {
        float t = props.getHighAstigmatismCyl();
        return abs(r.getCylLeft()) >= t || abs(r.getCylRight()) >= t;
    }

    /** Quá hạn: có hẹn tái khám và đã qua hạn quá số ngày quy định */
    public boolean isOverdueFollowup(EyeExamRecord r, LocalDate today) {
        LocalDate d = r.getFollowupDate();
        return d != null && ChronoUnit.DAYS.between(d, today) > props.getOverdueDays();
    }

    private boolean neg(Float v, float t) {
        return v != null && v < t;
    }

    private boolean le(Float v, float t) {
        return v != null && v <= t;
    }

    private float abs(Float v) {
        return v == null ? 0f : Math.abs(v);
    }

    private boolean inRange(Float v) {
        return v != null && v >= props.getBorderlineSphMin() && v <= props.getBorderlineSphMax();
    }
}
