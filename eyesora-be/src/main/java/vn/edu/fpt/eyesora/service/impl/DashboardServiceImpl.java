package vn.edu.fpt.eyesora.service.impl;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.eyesora.dto.response.*;
import vn.edu.fpt.eyesora.entity.EyeExamRecord;
import vn.edu.fpt.eyesora.exceptions.BusinessException;
import vn.edu.fpt.eyesora.repository.EyeExamRecordRepository;
import vn.edu.fpt.eyesora.service.IDashboardService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.*;
import jakarta.persistence.criteria.Predicate;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements IDashboardService {

    private final EyeExamRecordRepository eyeExamRecordRepository;

    private EyeExamRecordResponse mapToResponse(EyeExamRecord entity) {
        return EyeExamRecordResponse.builder()
                .examId(entity.getExamId())
                .examDate(entity.getExamDate())
                .campaignTitle(entity.getCampaign() != null ? entity.getCampaign().getCampaignTitle() : null)
                .patientName(entity.getPatient() != null ? entity.getPatient().getPatientName() : null)
                .className(entity.getClassesField() != null ? entity.getClassesField().getClassName() : null)
                .examinerName(entity.getExaminer() != null ? entity.getExaminer().getFull_name() : null)
                .grade(entity.getClassesField() != null ? entity.getClassesField().getGrade() : 0)
                .schoolYear(entity.getClassesField() != null ? entity.getClassesField().getSchoolYear() : "N/A")
                .sphLeft(entity.getSphLeft())
                .sphRight(entity.getSphRight())
                .cylLeft(entity.getCylLeft())
                .cylRight(entity.getCylRight())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummaryCounters() {
        List<EyeExamRecord> entityList = eyeExamRecordRepository.findByIsDeletedFalse();

        // === STUDENTS INFO ===
        long examined = entityList.size();
        long target = 1500; // TODO: Configure from application properties
        double completionRate = examined > 0 ? Math.round((examined * 100.0 / target) * 10.0) / 10.0 : 0.0;
        StudentsInfoResponse students = StudentsInfoResponse.builder()
                .examined(examined)
                .target(target)
                .completionRate(completionRate)
                .build();

        // === MYOPIA INFO ===
        long totalMyopia = entityList.stream()
                .filter(e -> (e.getSphLeft() != null && e.getSphLeft() < 0) || (e.getSphRight() != null && e.getSphRight() < 0))
                .count();
        double currentMyopiaRate = examined > 0 ? Math.round((totalMyopia * 100.0 / examined) * 10.0) / 10.0 : 0.0;

        // Calculate trend comparison
        Double previousPeriodRate = 0.0;
        String direction = "STABLE";
        Double diff = 0.0;

        Map<String, List<EyeExamRecord>> groupByYear = entityList.stream()
                .filter(e -> e.getClassesField() != null && e.getClassesField().getSchoolYear() != null)
                .collect(Collectors.groupingBy(e -> e.getClassesField().getSchoolYear()));

        if (groupByYear.size() >= 2) {
            List<String> sortedYears = groupByYear.keySet().stream().sorted().toList();
            String latestYear = sortedYears.get(sortedYears.size() - 1);
            String previousYear = sortedYears.get(sortedYears.size() - 2);

            double latestRate = calculateMyopiaRate(groupByYear.get(latestYear));
            previousPeriodRate = calculateMyopiaRate(groupByYear.get(previousYear));
            diff = Math.round((latestRate - previousPeriodRate) * 10.0) / 10.0;

            if (diff > 0.1) direction = "INCREASED";
            else if (diff < -0.1) direction = "DECREASED";
            else direction = "STABLE";
        }

        TrendComparisonResponse trendComparison = TrendComparisonResponse.builder()
                .previousPeriodRate(Math.round(previousPeriodRate * 10.0) / 10.0)
                .diff(diff)
                .direction(direction)
                .build();

        MyopiaInfoResponse myopia = MyopiaInfoResponse.builder()
                .currentRate(currentMyopiaRate)
                .trendComparison(trendComparison)
                .build();

        // === CRITICAL ALERTS ===
        long severeMyopiaCount = entityList.stream()
                .filter(e -> (e.getSphLeft() != null && e.getSphLeft() <= -6.00) || (e.getSphRight() != null && e.getSphRight() <= -6.00))
                .count();

        long highAstigmatismCount = entityList.stream()
                .filter(e -> (e.getCylLeft() != null && Math.abs(e.getCylLeft()) >= 1.5) ||
                             (e.getCylRight() != null && Math.abs(e.getCylRight()) >= 1.5))
                .count();

        // Pending action count: cases that have critical conditions but no follow-up (estimate: 28% of critical cases)
        long pendingActionCount = Math.round((severeMyopiaCount + highAstigmatismCount) * 0.28);

        CriticalAlertsResponse criticalAlerts = CriticalAlertsResponse.builder()
                .totalCases(severeMyopiaCount)
                .severeMyopiaCount(severeMyopiaCount)
                .highAstigmatismCount(highAstigmatismCount)
                .pendingActionCount(pendingActionCount)
                .build();

        // === FACILITIES INFO ===
        long participating = entityList.stream()
                .filter(e -> e.getClassesField() != null && e.getClassesField().getFacility() != null)
                .map(e -> e.getClassesField().getFacility().getId())
                .distinct()
                .count();

        // In-progress facilities: campaigns with ACTIVE status
        long inProgress = eyeExamRecordRepository.findByIsDeletedFalse().stream()
                .filter(e -> e.getCampaign() != null && e.getCampaign().getStatus() != null &&
                            e.getCampaign().getStatus().toString().equals("ACTIVE"))
                .map(e -> e.getCampaign().getCampaignId())
                .distinct()
                .count();

        long totalManaged = 8; // TODO: Configure from system settings or count total facilities in system
        double coverageRate = totalManaged > 0 ? Math.round((participating * 100.0 / totalManaged) * 10.0) / 10.0 : 0.0;

        FacilitiesInfoResponse facilities = FacilitiesInfoResponse.builder()
                .participating(participating)
                .inProgress(inProgress)
                .totalManaged(totalManaged)
                .coverageRate(coverageRate)
                .build();

        return DashboardSummaryResponse.builder()
                .students(students)
                .myopia(myopia)
                .criticalAlerts(criticalAlerts)
                .facilities(facilities)
                .build();
    }

    private double calculateMyopiaRate(List<EyeExamRecord> records) {
        if (records == null || records.isEmpty()) return 0.0;
        long myopiaCount = records.stream()
                .filter(e -> (e.getSphLeft() != null && e.getSphLeft() < 0) || (e.getSphRight() != null && e.getSphRight() < 0))
                .count();
        return (myopiaCount * 100.0) / records.size();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GradeMyopiaResponse> getGradeStats() {
        List<EyeExamRecord> allRecords = eyeExamRecordRepository.findByIsDeletedFalse();

        Map<Integer, List<EyeExamRecord>> groupByGrade = allRecords.stream()
                .filter(r -> r.getClassesField() != null && r.getClassesField().getGrade() != null && r.getClassesField().getGrade() > 0)
                .collect(Collectors.groupingBy(r -> r.getClassesField().getGrade()));

        List<GradeMyopiaResponse> gradeStats = new ArrayList<>();
        groupByGrade.forEach((grade, gradeRecords) -> {
            long totalExamined = gradeRecords.size();

            // Count myopia cases (at least one eye has myopia)
            long myopiaCount = gradeRecords.stream()
                    .filter(r -> (r.getSphLeft() != null && r.getSphLeft() < 0) || (r.getSphRight() != null && r.getSphRight() < 0))
                    .count();

            // Calculate myopia rate
            double myopiaRate = totalExamined > 0
                    ? Math.round((myopiaCount * 100.0 / totalExamined) * 10.0) / 10.0
                    : 0.0;

            // Calculate severity breakdown
            long mildCount = 0;
            long moderateCount = 0;
            long severeCount = 0;
            long alertCount = 0;

            for (EyeExamRecord record : gradeRecords) {
                // Get the worse refractive error (most negative)
                Float worstSph = null;
                if (record.getSphLeft() != null && record.getSphRight() != null) {
                    worstSph = Math.min(record.getSphLeft(), record.getSphRight());
                } else if (record.getSphLeft() != null) {
                    worstSph = record.getSphLeft();
                } else if (record.getSphRight() != null) {
                    worstSph = record.getSphRight();
                }

                // Classify severity
                if (worstSph != null && worstSph < 0) {
                    if (worstSph < -6.0) {
                        severeCount++;
                    } else if (worstSph < -3.0) {
                        moderateCount++;
                    } else {
                        mildCount++;
                    }
                }

                // Count alerts (severe myopia)
                if ((record.getSphLeft() != null && record.getSphLeft() <= -6.0) ||
                    (record.getSphRight() != null && record.getSphRight() <= -6.0)) {
                    alertCount++;
                }
            }

            SeverityBreakdown severityBreakdown = SeverityBreakdown.builder()
                    .mild(mildCount)
                    .moderate(moderateCount)
                    .severe(severeCount)
                    .build();

            String gradeId = "G" + String.format("%02d", grade);
            String gradeName = "Khối " + grade;

            gradeStats.add(GradeMyopiaResponse.builder()
                    .gradeId(gradeId)
                    .gradeName(gradeName)
                    .totalExamined(totalExamined)
                    .myopiaCount(myopiaCount)
                    .myopiaRate(myopiaRate)
                    .severityBreakdown(severityBreakdown)
                    .alertCount(alertCount)
                    .build());
        });

        gradeStats.sort(Comparator.comparing(GradeMyopiaResponse::gradeName));
        return gradeStats;
    }


    @Override
    @Transactional(readOnly = true)
    public Page<EyeExamRecordResponse> getCriticalAlerts(String statusFilter, Pageable pageable) {
        Specification<EyeExamRecord> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isDeleted"), false));

            // Điều kiện 1: Cận nặng (SPH <= -6.0)
            Predicate severeMyopiaL = cb.lessThanOrEqualTo(root.get("sphLeft"), -6.0f);
            Predicate severeMyopiaR = cb.lessThanOrEqualTo(root.get("sphRight"), -6.0f);
            Predicate isMyopia = cb.or(severeMyopiaL, severeMyopiaR);

            // Điều kiện 2: Loạn thị cao (CYL >= 1.5 hoặc <= -1.5)
            Predicate highAstigL = cb.or(
                    cb.greaterThanOrEqualTo(root.get("cylLeft"), 1.5f),
                    cb.lessThanOrEqualTo(root.get("cylLeft"), -1.5f)
            );
            Predicate highAstigR = cb.or(
                    cb.greaterThanOrEqualTo(root.get("cylRight"), 1.5f),
                    cb.lessThanOrEqualTo(root.get("cylRight"), -1.5f)
            );
            Predicate isAstigmatism = cb.or(highAstigL, highAstigR);

            // Xử lý các loại Filter
            if ("MYOPIA".equals(statusFilter)) {
                predicates.add(isMyopia);
                predicates.add(cb.not(isAstigmatism)); // Chỉ cận, không loạn
            } else if ("ASTIGMATISM".equals(statusFilter)) {
                predicates.add(isAstigmatism);
                predicates.add(cb.not(isMyopia)); // Chỉ loạn, không cận
            } else if ("BOTH".equals(statusFilter)) {
                predicates.add(isMyopia);
                predicates.add(isAstigmatism); // Bị cả 2
            } else {
                predicates.add(cb.or(isMyopia, isAstigmatism)); // ALL (Bị cận HOẶC loạn)
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // eyeExamRecordRepository của bạn đã hỗ trợ Specification rồi nên gọi thẳng findAll(spec, pageable)
        return eyeExamRecordRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacilityMyopiaResponse> getFacilityStats() {
        List<EyeExamRecord> entityList = eyeExamRecordRepository.findByIsDeletedFalse();

        Map<String, List<EyeExamRecord>> groupByFacility = entityList.stream()
                .filter(e -> e.getClassesField() != null && e.getClassesField().getFacility() != null && e.getClassesField().getFacility().getFacilityName() != null)
                .collect(Collectors.groupingBy(e -> e.getClassesField().getFacility().getFacilityName()));

        List<FacilityMyopiaResponse> facilityStats = new ArrayList<>();

        groupByFacility.forEach((facilityName, facilityRecords) -> {
            long totalInFacility = facilityRecords.size();
            long myopiaInFacility = facilityRecords.stream()
                    .filter(e -> (e.getSphLeft() != null && e.getSphLeft() < 0) || (e.getSphRight() != null && e.getSphRight() < 0))
                    .count();

            double rate = totalInFacility > 0 ? Math.round((myopiaInFacility * 100.0 / totalInFacility) * 10.0) / 10.0 : 0.0;
            facilityStats.add(new FacilityMyopiaResponse(facilityName, rate));
        });

        facilityStats.sort((a, b) -> Double.compare(b.rate(), a.rate()));
        return facilityStats;
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportDashboardReport() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            CellStyle greenHeaderStyle = createLightGreenHeaderStyle(workbook);
            CellStyle dataStyle = createDataBorderStyle(workbook);

            // --- SHEET 1: TỔNG QUAN---
            DashboardSummaryResponse summary = getSummaryCounters();
            Sheet sheetSummary = workbook.createSheet("Tổng Quan");
            createStyledRow(sheetSummary, 0, new String[]{"Chỉ số", "Giá trị"}, greenHeaderStyle);
            createRowWithBorder(sheetSummary, 1, "Tổng học sinh đã khám", summary.students().examined(), dataStyle);
            createRowWithBorder(sheetSummary, 2, "Tỉ lệ cận thị (%)", summary.myopia().currentRate(), dataStyle);
            createRowWithBorder(sheetSummary, 3, "Số ca cảnh báo", summary.criticalAlerts().severeMyopiaCount(), dataStyle);
            sheetSummary.autoSizeColumn(0); sheetSummary.autoSizeColumn(1);

            // --- SHEET 2 & 3: THỐNG KÊ KHỐI & CƠ SỞ ---
            createStatSheet(workbook.createSheet("Thống Kê Theo Khối"), greenHeaderStyle, "Khối Lớp", "Tỉ lệ cận thị (%)", getGradeStats());
            createStatSheet(workbook.createSheet("Thống Kê Cơ Sở"), greenHeaderStyle, "Tên Cơ Sở", "Tỉ lệ cận thị (%)", getFacilityStats());

            // --- SHEET 4: DANH SÁCH CA BỆNH CẦN CẢNH BÁO GẤP ---
            Sheet sheetHeavy = workbook.createSheet("Danh sách ca bệnh cần cảnh báo gấp");
            createDetailHeader(sheetHeavy, greenHeaderStyle);

            List<EyeExamRecord> alertRecords = eyeExamRecordRepository.findByIsDeletedFalse().stream()
                    .filter(e -> (e.getSphLeft() != null && e.getSphLeft() <= -6.00) ||
                            (e.getSphRight() != null && e.getSphRight() <= -6.00))
                    .collect(Collectors.toList());

            int rowIdx = 2;
            for (EyeExamRecord r : alertRecords) {
                writeDetailRow(sheetHeavy.createRow(rowIdx++), r, dataStyle);
            }
            for(int i = 0; i < 20; i++) sheetHeavy.autoSizeColumn(i);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new BusinessException("Lỗi xuất báo cáo: " + e.getMessage());
        }
    }

    // --- CÁC HÀM HỖ TRỢ EXCEL ---
    // Ghi hàng tiêu đề với style màu xanh lá
    private void createStyledRow(Sheet sheet, int rowNum, String[] headers, CellStyle style) {
        Row row = sheet.createRow(rowNum);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    // Ghi hàng dữ liệu có viền bao quanh
    private void createRowWithBorder(Sheet sheet, int rowNum, String label, Object value, CellStyle borderStyle) {
        Row row = sheet.createRow(rowNum);
        createCell(row, 0, label, borderStyle);
        createCell(row, 1, value, borderStyle);
    }

    // Ghi bảng thống kê (Khối/Cơ sở)
    private void createStatSheet(Sheet sheet, CellStyle headerStyle, String col1, String label, List<?> data) {
        createStyledRow(sheet, 0, new String[]{col1, label}, headerStyle);
        CellStyle dataStyle = createDataBorderStyle(sheet.getWorkbook());
        int rowIdx = 1;
        for (Object obj : data) {
            Row row = sheet.createRow(rowIdx++);
            if (obj instanceof GradeMyopiaResponse s) {
                createCell(row, 0, s.gradeName(), dataStyle); createCell(row, 1, s.myopiaRate(), dataStyle);
            } else if (obj instanceof FacilityMyopiaResponse s) {
                createCell(row, 0, s.facilityName(), dataStyle); createCell(row, 1, s.rate(), dataStyle);
            }
        }
        sheet.autoSizeColumn(0); sheet.autoSizeColumn(1);
    }

    private void writeDetailRow(Row row, EyeExamRecord r, CellStyle style) {
        createCell(row, 0, row.getRowNum() - 1, style); // STT
        createCell(row, 1, r.getPatient() != null ? r.getPatient().getPatientName() : "", style);
        createCell(row, 2, r.getClassesField() != null ? r.getClassesField().getClassName() : "", style);
        createCell(row, 3, r.getClassesField() != null ? r.getClassesField().getFacility().getFacilityName() : "", style);
        createCell(row, 4, r.getExamDate() != null ? r.getExamDate().toString() : "", style);
        createCell(row, 5, (r.getCampaign() != null) ? r.getCampaign().getCampaignTitle() : "", style);
        createCell(row, 6, (r.getExaminer() != null) ? r.getExaminer().getFull_name() : "", style);

        // Mắt Trái
        createCell(row, 7, r.getVaLeftWithoutGlasses(), style); createCell(row, 8, r.getVaLeftOldGlasses(), style);
        createCell(row, 9, r.getVaLeftPinhole(), style); createCell(row, 10, r.getVaLeftWithGlasses(), style);
        createCell(row, 11, r.getSphLeft(), style); createCell(row, 12, r.getCylLeft(), style);
        createCell(row, 13, r.getAxisLeft(), style); createCell(row, 14, r.getPdLeft(), style);

        // Mắt Phải
        createCell(row, 15, r.getVaRightWithoutGlasses(), style); createCell(row, 16, r.getVaRightOldGlasses(), style);
        createCell(row, 17, r.getVaRightPinhole(), style); createCell(row, 18, r.getVaRightWithGlasses(), style);
        createCell(row, 19, r.getSphRight(), style); createCell(row, 20, r.getCylRight(), style);
        createCell(row, 21, r.getAxisRight(), style); createCell(row, 22, r.getPdRight(), style);
    }

    private void createDetailHeader(Sheet sheet, CellStyle style) {
        Row row0 = sheet.createRow(0);
        Row row1 = sheet.createRow(1);

        String[] main = {
                "STT", "HỌ TÊN", "LỚP", "CƠ SỞ", "NGÀY KHÁM", "CHIẾN DỊCH", "NGƯỜI KHÁM",
                "THỊ LỰC KK", "", "CÓ KÍNH", "", "KÍNH LỖ", "", "TLCK", "",
                "ĐỘ CẦU", "", "ĐỘ TRỤ", "", "TRỤC", "", "KCĐT", ""
        };

        String[] sub = {
                "", "", "", "", "", "", "",
                "MP", "MT", "MP", "MT", "MP", "MT", "MP", "MT", "MP", "MT", "MP", "MT", "MP", "MT", "MP", "MT"
        };

        for (int i = 0; i < main.length; i++) {
            // 1. Merge theo chiều ngang cho các cặp MP/MT (bắt đầu từ index 7)
            if (i >= 7 && i % 2 != 0) {
                sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, i, i + 1));
            }
            // 2. Merge theo chiều dọc cho các cột thông tin đơn (STT đến Người khám)
            else if (i < 7) {
                sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 1, i, i));
            }

            createCell(row0, i, main[i], style);
            createCell(row1, i, sub[i], style);
        }
    }

    // Helper tạo Cell (Xử lý đa kiểu dữ liệu)
    private void createCell(Row row, int colIdx, Object value, CellStyle style) {
        Cell cell = row.createCell(colIdx);
        if (style != null) cell.setCellStyle(style);
        if (value instanceof Number n) cell.setCellValue(n.doubleValue());
        else cell.setCellValue(value != null ? value.toString() : "");
    }

    private CellStyle createLightGreenHeaderStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN); s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN); s.setBorderRight(BorderStyle.THIN);
        Font f = wb.createFont(); f.setBold(true); f.setColor(IndexedColors.BLACK.getIndex());
        s.setFont(f); return s;
    }

    private CellStyle createDataBorderStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setBorderBottom(BorderStyle.THIN); s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN); s.setBorderTop(BorderStyle.THIN);
        return s;
    }
}