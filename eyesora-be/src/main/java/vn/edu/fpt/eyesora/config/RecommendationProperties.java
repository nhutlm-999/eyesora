package vn.edu.fpt.eyesora.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "eyesora.recommendation")
public class RecommendationProperties {
    private int overdueDays = 30;
    private float highAstigmatismCyl = 1.50f;
    private float severeMyopiaSph = -6.00f;
    private float borderlineSphMin = -3.00f;
    private float borderlineSphMax = -2.50f;
    private int minGroupSize = 20;
    private int maxResults = 5;
    private Overdue overdue = new Overdue();
    private double severeRate = 2.0;
    private double astigmatismRate = 5.0;
    private double myopiaGapVsAverage = 10.0;

    @Data
    public static class Overdue {
        private double rate = 10.0;
        private int count = 20;
    }
}
