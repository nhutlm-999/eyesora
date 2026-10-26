package vn.edu.fpt.eyesora.service.recommendation;

import static vn.edu.fpt.eyesora.dto.response.Recommendation.Audience.*;
import static vn.edu.fpt.eyesora.dto.response.Recommendation.Priority.*;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import vn.edu.fpt.eyesora.config.RecommendationProperties;
import vn.edu.fpt.eyesora.dto.response.*;

@Component
@RequiredArgsConstructor
public class RecommendationEngine {
    private final RecommendationProperties p;

    public List<Recommendation> evaluate(List<GroupStats> groups, String filterKey) {
        List<Recommendation> out = new ArrayList<>();

        long totalExaminedAll = groups.stream().mapToLong(GroupStats::total).sum();
        long totalMyopicAll = groups.stream().mapToLong(GroupStats::myopic).sum();
        double avgMyopiaRate = totalExaminedAll == 0 ? 0 : Math.round(totalMyopicAll * 1000.0 / totalExaminedAll) / 10.0;

        // Lọc các nhóm đủ độ tin cậy về quy mô mẫu
        List<GroupStats> validGroups = groups.stream()
                .filter(g -> g.total() >= p.getMinGroupSize())
                .collect(Collectors.toList());

        if (validGroups.isEmpty()) {
            return out;
        }

        // =========================================================================
        // 1. QUY TẮC: QUÁ HẠN TÁI KHÁM (OVERDUE_FOLLOWUP) - GỘP THÀNH 1 CARD DUY NHẤT
        // =========================================================================
        List<GroupStats> overdueGroups = validGroups.stream()
                .filter(g -> g.overdue() > 0 && (g.rate(g.overdue()) >= p.getOverdue().getRate() || g.overdue() >= p.getOverdue().getCount()))
                .sorted((a, b) -> Long.compare(b.overdue(), a.overdue()))
                .collect(Collectors.toList());

        if (!overdueGroups.isEmpty()) {
            long totalOverdue = overdueGroups.stream().mapToLong(GroupStats::overdue).sum();
            long totalPop = overdueGroups.stream().mapToLong(GroupStats::total).sum();
            double overallOverdueRate = totalPop == 0 ? 0 : Math.round(totalOverdue * 1000.0 / totalPop) / 10.0;

            List<ScopeStat> breakdown = overdueGroups.stream().map(g -> new ScopeStat(
                    g.name(),
                    g.overdue(),
                    g.total(),
                    g.rate(g.overdue()),
                    filterKey != null ? filterKey + "=" + g.name() + "&status=OVERDUE" : null
            )).collect(Collectors.toList());

            List<String> insights = new ArrayList<>();
            insights.add(String.format("Phát hiện %d nhóm ghi nhận tỷ lệ quá hạn tái khám vượt ngưỡng cảnh báo (ngưỡng quy định: ≥%.0f%% hoặc ≥%d học sinh).",
                    overdueGroups.size(), p.getOverdue().getRate(), (int)p.getOverdue().getCount()));
            GroupStats worstOverdue = overdueGroups.get(0);
            insights.add(String.format("Trọng điểm cần can thiệp: %s có số lượng quá hạn cao nhất với %d học sinh (chiếm %.1f%% sĩ số đã khám của nhóm).",
                    worstOverdue.name(), worstOverdue.overdue(), worstOverdue.rate(worstOverdue.overdue())));

            List<ActionItem> actions = List.of(
                    new ActionItem("Y tế học đường", "Xuất danh sách " + totalOverdue + " hồ sơ quá hạn, rà soát phân loại theo mức độ tật khúc xạ để xếp thứ tự ưu tiên khám bù trong tuần.", "Trong tuần này"),
                    new ActionItem("Ban giám hiệu & GVCN", "Kích hoạt thông báo tự động / gửi tin nhắn trực tiếp đến phụ huynh của các lớp trọng điểm (" + worstOverdue.name() + ") để nhắc lịch đo thị lực.", "3 - 5 ngày tới"),
                    new ActionItem("Chuyên khoa mắt đối tác", "Bố trí buổi tái khám tập trung lưu động tại trường cho nhóm học sinh quá hạn trên 60 ngày nhằm hạn chế tình trạng sai lệch độ kính.", "Trong tháng này")
            );

            String scopeDisplay = overdueGroups.size() == 1 ? overdueGroups.get(0).name() : overdueGroups.size() + " nhóm trọng điểm";
            String primaryAction = "Phân loại danh sách " + totalOverdue + " hồ sơ để gửi thông báo nhắc lịch và tổ chức đợt tái khám bù.";

            out.add(new Recommendation(
                    "OVERDUE_FOLLOWUP", HIGH, SCHOOL_HEALTH, scopeDisplay,
                    "Cảnh báo học sinh quá hạn tái khám",
                    String.format("Tổng cộng %d/%d học sinh (%.1f%%) thuộc %d nhóm đã quá hạn tái khám định kỳ trên %d ngày mà chưa có bản ghi khám cập nhật.",
                            totalOverdue, totalPop, overallOverdueRate, overdueGroups.size(), p.getOverdueDays()),
                    primaryAction,
                    new RecommendationEvidence(totalOverdue, totalPop, overallOverdueRate, p.getOverdue().getRate()),
                    overdueGroups.size() == 1 ? breakdown.get(0).listFilter() : null,
                    breakdown, actions, insights
            ));
        }

        // =========================================================================
        // 2. QUY TẮC: CẬN THỊ NẶNG (SEVERE_MYOPIA - SPH <= -6.00D) - GỘP THÀNH 1 CARD
        // =========================================================================
        List<GroupStats> severeGroups = validGroups.stream()
                .filter(g -> g.severe() > 0 && g.rate(g.severe()) >= p.getSevereRate())
                .sorted((a, b) -> Long.compare(b.severe(), a.severe()))
                .collect(Collectors.toList());

        if (!severeGroups.isEmpty()) {
            long totalSevere = severeGroups.stream().mapToLong(GroupStats::severe).sum();
            long totalPop = severeGroups.stream().mapToLong(GroupStats::total).sum();
            double overallSevereRate = totalPop == 0 ? 0 : Math.round(totalSevere * 1000.0 / totalPop) / 10.0;

            List<ScopeStat> breakdown = severeGroups.stream().map(g -> new ScopeStat(
                    g.name(),
                    g.severe(),
                    g.total(),
                    g.rate(g.severe()),
                    filterKey != null ? filterKey + "=" + g.name() + "&severity=SEVERE" : null
            )).collect(Collectors.toList());

            List<String> insights = new ArrayList<>();
            insights.add(String.format("Ghi nhận %d học sinh cận thị nặng (SPH ≤ %.2fD) tại %d nhóm, chiếm tỷ lệ %.1f%% dân số khám (vượt ngưỡng cho phép %.1f%%).",
                    totalSevere, p.getSevereMyopiaSph(), severeGroups.size(), overallSevereRate, p.getSevereRate()));
            GroupStats worstSevere = severeGroups.get(0);
            insights.add(String.format("Khối/Trường có số ca cận nặng nhiều nhất: %s ghi nhận %d ca (%.1f%%), tiềm ẩn nguy cơ cao về thoái hóa hắc võng mạc và bong võng mạc nếu không được kiểm soát đáy mắt.",
                    worstSevere.name(), worstSevere.severe(), worstSevere.rate(worstSevere.severe())));

            List<ActionItem> actions = List.of(
                    new ActionItem("Y tế học đường", "Tách riêng " + totalSevere + " hồ sơ cận nặng vào danh mục 'Bảo vệ thị lực đặc biệt', kiểm tra tình trạng đeo kính đúng số của từng em.", "Ngay trong tuần"),
                    new ActionItem("Phụ huynh học sinh", "Tư vấn phụ huynh đưa học sinh đi soi đáy mắt và chụp cắt lớp quang học (OCT) bán phần sau tại bệnh viện mắt chuyên khoa.", "Ưu tiên sớm"),
                    new ActionItem("Ban giám hiệu & Cơ sở vật chất", "Bố trí chỗ ngồi tại các dãy bàn đầu có góc nhìn chính diện bảng, tránh ánh sáng phản chiếu gây căng thẳng điều tiết.", "Học kỳ này"),
                    new ActionItem("Giải pháp y khoa nâng cao", "Tham vấn bác sĩ nhãn khoa về các giải pháp can thiệp làm chậm tiến triển cận: kính áp tròng ban đêm Ortho-K, tròng kính kiểm soát cận thị (DIMS/H.A.L.T) hoặc nhỏ Atropine nồng độ thấp.", "Định kỳ 3 - 6 tháng")
            );

            String scopeDisplay = severeGroups.size() == 1 ? severeGroups.get(0).name() : severeGroups.size() + " nhóm có ca cận nặng";
            String primaryAction = "Lập hồ sơ quản lý đáy mắt riêng cho " + totalSevere + " học sinh cận nặng và tư vấn can thiệp chuyên sâu.";

            out.add(new Recommendation(
                    "SEVERE_MYOPIA", HIGH, SCHOOL_HEALTH, scopeDisplay,
                    "Phân tích ca cận thị nặng & Giải pháp phòng ngừa biến chứng",
                    String.format("Toàn hệ thống có %d ca cận nặng (SPH ≤ %.2fD) phân bổ tại %d nhóm. Đây là nhóm đối tượng có nguy cơ tổn thương cấu trúc đáy mắt.",
                            totalSevere, p.getSevereMyopiaSph(), severeGroups.size()),
                    primaryAction,
                    new RecommendationEvidence(totalSevere, totalPop, overallSevereRate, p.getSevereRate()),
                    severeGroups.size() == 1 ? breakdown.get(0).listFilter() : null,
                    breakdown, actions, insights
            ));
        }

        // =========================================================================
        // 3. QUY TẮC: LOẠN THỊ CAO (HIGH_ASTIGMATISM - |CYL| >= 1.50D) - GỘP THÀNH 1 CARD
        // =========================================================================
        List<GroupStats> astGroups = validGroups.stream()
                .filter(g -> g.highAstigmatism() > 0 && g.rate(g.highAstigmatism()) >= p.getAstigmatismRate())
                .sorted((a, b) -> Long.compare(b.highAstigmatism(), a.highAstigmatism()))
                .collect(Collectors.toList());

        if (!astGroups.isEmpty()) {
            long totalAst = astGroups.stream().mapToLong(GroupStats::highAstigmatism).sum();
            long totalPop = astGroups.stream().mapToLong(GroupStats::total).sum();
            double overallAstRate = totalPop == 0 ? 0 : Math.round(totalAst * 1000.0 / totalPop) / 10.0;

            List<ScopeStat> breakdown = astGroups.stream().map(g -> new ScopeStat(
                    g.name(),
                    g.highAstigmatism(),
                    g.total(),
                    g.rate(g.highAstigmatism()),
                    filterKey != null ? filterKey + "=" + g.name() + "&astigmatism=HIGH" : null
            )).collect(Collectors.toList());

            List<String> insights = new ArrayList<>();
            insights.add(String.format("Có %d học sinh có độ loạn thị cao (|CYL| ≥ %.2fD) tại %d nhóm, tỷ lệ trung bình %.1f%% (ngưỡng tiêu chuẩn: %.1f%%).",
                    totalAst, p.getHighAstigmatismCyl(), astGroups.size(), overallAstRate, p.getAstigmatismRate()));
            insights.add("Loạn thị cao không được chỉnh quang tối ưu hoặc đeo sai trục kính (Axis) là nguyên nhân hàng đầu gây nhược thị (mắt lười) và mỏi mắt mạn tính ở lứa tuổi học sinh.");

            List<ActionItem> actions = List.of(
                    new ActionItem("Phụ huynh", "Đưa học sinh đi đo thị lực có chỉnh kính tối ưu (BCVA) và kiểm tra lại trục thấu kính trụ của kính hiện hành.", "Trong 2 tuần"),
                    new ActionItem("Y tế trường", "Khảo sát triệu chứng lâm sàng (nheo mắt, đau đầu khi đọc sách, chép bài sai) ở nhóm " + totalAst + " học sinh này.", "Trong tháng"),
                    new ActionItem("Phòng học", "Tăng cường chiếu sáng đồng đều trên mặt phẳng bàn học (≥ 300 - 500 lux), giảm chóa đèn để mắt đỡ mệt mỏi điều tiết.", "Thường xuyên")
            );

            String scopeDisplay = astGroups.size() == 1 ? astGroups.get(0).name() : astGroups.size() + " nhóm có loạn thị cao";
            out.add(new Recommendation(
                    "HIGH_ASTIGMATISM", MEDIUM, PARENT, scopeDisplay,
                    "Kiểm soát loạn thị cao & Nguy cơ nhược thị",
                    String.format("Phát hiện %d học sinh có độ loạn cao (|CYL| ≥ %.2fD) tại %d nhóm. Cần can thiệp chỉnh quang đúng trục để phòng ngừa suy giảm thị lực vĩnh viễn.",
                            totalAst, p.getHighAstigmatismCyl(), astGroups.size()),
                    "Thông báo phụ huynh kiểm tra lại trục kính (Axis) và độ trụ; cải thiện chiếu sáng giảm căng thẳng điều tiết.",
                    new RecommendationEvidence(totalAst, totalPop, overallAstRate, p.getAstigmatismRate()),
                    astGroups.size() == 1 ? breakdown.get(0).listFilter() : null,
                    breakdown, actions, insights
            ));
        }

        // =========================================================================
        // 4. QUY TẮC: TỶ LỆ CẬN CAO HƠN TRUNG BÌNH (HIGH_MYOPIA_GROUP) - GỘP THÀNH 1 CARD
        // =========================================================================
        List<GroupStats> highMyopiaGroups = validGroups.stream()
                .filter(g -> g.rate(g.myopic()) - avgMyopiaRate >= p.getMyopiaGapVsAverage())
                .sorted((a, b) -> Double.compare(b.rate(b.myopic()), a.rate(a.myopic())))
                .collect(Collectors.toList());

        if (!highMyopiaGroups.isEmpty()) {
            List<ScopeStat> breakdown = highMyopiaGroups.stream().map(g -> new ScopeStat(
                    g.name(),
                    g.myopic(),
                    g.total(),
                    g.rate(g.myopic()),
                    filterKey != null ? filterKey + "=" + g.name() + "&myopia=true" : null
            )).collect(Collectors.toList());

            List<String> insights = new ArrayList<>();
            GroupStats worstGroup = highMyopiaGroups.get(0);
            double gap = Math.round((worstGroup.rate(worstGroup.myopic()) - avgMyopiaRate) * 10.0) / 10.0;
            insights.add(String.format("Tỷ lệ cận thị bình quân toàn bộ hệ thống đang là %.1f%%. Có %d nhóm vượt quá mức này từ %.1f điểm %% trở lên.",
                    avgMyopiaRate, highMyopiaGroups.size(), p.getMyopiaGapVsAverage()));
            insights.add(String.format("Nhóm dẫn đầu độ lệch: %s với tỷ lệ cận thị %.1f%% (cao hơn trung bình %.1f%%).",
                    worstGroup.name(), worstGroup.rate(worstGroup.myopic()), gap));

            List<ActionItem> actions = List.of(
                    new ActionItem("Ban giám hiệu", "Tái cấu trúc thời khóa biểu: cam kết duy trì tối thiểu 60-90 phút/ngày hoạt động ngoài trời dưới ánh sáng tự nhiên.", "Ngay học kỳ này"),
                    new ActionItem("Giáo viên bộ môn", "Áp dụng nghiêm ngặt quy tắc thị giác 20-20-20 trong giờ học: cứ sau 20 phút nhìn gần, cho mắt nghỉ nhìn xa 20 feet (6m) trong 20 giây.", "Hàng ngày"),
                    new ActionItem("Ban phụ huynh", "Phối hợp giám sát thời gian sử dụng thiết bị điện tử giải trí của học sinh tại nhà (khuyến cáo không quá 60 phút/ngày vào ngày học).", "Hàng tuần")
            );

            String scopeDisplay = highMyopiaGroups.size() == 1 ? highMyopiaGroups.get(0).name() : highMyopiaGroups.size() + " nhóm vượt mức trung bình";
            out.add(new Recommendation(
                    "HIGH_MYOPIA_GROUP", MEDIUM, SCHOOL_BOARD, scopeDisplay,
                    "Điều chỉnh môi trường học đường cho các nhóm tỷ lệ cận vượt chuẩn",
                    String.format("Có %d nhóm có tỷ lệ cận thị cao hơn mặt bằng chung (%.1f%%) từ %.1f%% trở lên, cần can thiệp đồng bộ vào hành vi học tập và sinh hoạt.",
                            highMyopiaGroups.size(), avgMyopiaRate, p.getMyopiaGapVsAverage()),
                    "Triển khai quy tắc nghỉ mắt 20-20-20, tăng thời lượng hoạt động ngoài trời và đo kiểm chuẩn ánh sáng phòng học.",
                    new RecommendationEvidence(highMyopiaGroups.stream().mapToLong(GroupStats::myopic).sum(),
                            highMyopiaGroups.stream().mapToLong(GroupStats::total).sum(),
                            worstGroup.rate(worstGroup.myopic()), avgMyopiaRate + p.getMyopiaGapVsAverage()),
                    highMyopiaGroups.size() == 1 ? breakdown.get(0).listFilter() : null,
                    breakdown, actions, insights
            ));
        }

        // =========================================================================
        // 5. QUY TẮC: RANH GIỚI CẬN VỪA (BORDERLINE_MYOPIA: -3.00D <= SPH <= -2.50D)
        // =========================================================================
        long totalBorderline = validGroups.stream().mapToLong(GroupStats::borderline).sum();
        if (totalBorderline > 0 && totalExaminedAll > 0) {
            double rate = Math.round(totalBorderline * 1000.0 / totalExaminedAll) / 10.0;

            List<ScopeStat> breakdown = validGroups.stream()
                    .filter(g -> g.borderline() > 0)
                    .sorted((a, b) -> Long.compare(b.borderline(), a.borderline()))
                    .map(g -> new ScopeStat(
                            g.name(),
                            g.borderline(),
                            g.total(),
                            g.rate(g.borderline()),
                            filterKey != null ? filterKey + "=" + g.name() : null
                    )).collect(Collectors.toList());

            List<String> insights = List.of(
                    String.format("Có %d học sinh (%.1f%%) đang ở 'giai đoạn ranh giới' (SPH từ %.2fD đến %.2fD).",
                            totalBorderline, rate, p.getBorderlineSphMin(), p.getBorderlineSphMax()),
                    "Theo dịch tễ học nhãn khoa, nếu không có giải pháp can thiệp ức chế tiến triển, nhóm cận vừa này sẽ chuyển dịch sang cận nặng (SPH ≤ -6.00D) trong vòng 2-3 năm tới."
            );

            List<ActionItem> actions = List.of(
                    new ActionItem("Tư vấn y tế học đường", "Gửi sổ tay hướng dẫn tư thế ngồi học, khoảng cách mắt - sách vở chuẩn (30 - 35cm) cho phụ huynh nhóm này.", "Trong tháng"),
                    new ActionItem("Giải pháp nhãn khoa can thiệp", "Tư vấn gia đình tham khảo giải pháp tròng kính đổi màu/chống ánh sáng xanh và giải pháp làm chậm tăng độ.", "Định kỳ"),
                    new ActionItem("Lịch theo dõi", "Rút ngắn chu kỳ tái khám từ 12 tháng xuống còn 6 tháng/lần đối với nhóm này.", "Học kỳ tới")
            );

            out.add(new Recommendation(
                    "BORDERLINE_MYOPIA", LOW, PARENT, "Toàn trường (" + validGroups.size() + " nhóm)",
                    "Phòng ngừa chuyển dịch cận thị trung bình sang cận thị nặng",
                    String.format("Ghi nhận %d học sinh đang ở ngưỡng ranh giới cận thị trung bình (%.2fD đến %.2fD). Đây là thời điểm vàng để can thiệp làm chậm tiến triển độ cận.",
                            totalBorderline, p.getBorderlineSphMin(), p.getBorderlineSphMax()),
                    "Rút ngắn chu kỳ tái khám xuống 6 tháng/lần và áp dụng các biện pháp kiểm soát tăng độ cận.",
                    new RecommendationEvidence(totalBorderline, totalExaminedAll, rate, null),
                    null, breakdown, actions, insights
            ));
        }

        // Sắp xếp thứ tự ưu tiên: HIGH -> MEDIUM -> LOW
        out.sort(Comparator.comparing(Recommendation::priority));

        return out;
    }
}
