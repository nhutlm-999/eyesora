package vn.edu.fpt.eyesora.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.eyesora.dto.response.FacilityAlertRecordResponse;
import vn.edu.fpt.eyesora.dto.response.FacilityGradeMyopiaResponse;
import vn.edu.fpt.eyesora.dto.response.FacilitySelectResponse;
import vn.edu.fpt.eyesora.dto.response.FacilitySummaryResponse;
import vn.edu.fpt.eyesora.entity.EyeExamRecord;
import vn.edu.fpt.eyesora.entity.Patient;
import vn.edu.fpt.eyesora.repository.EyeExamRecordRepository;
import vn.edu.fpt.eyesora.service.IFacilityDashboardService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityDashboardServiceImpl implements IFacilityDashboardService {

    private void checkFacilityOwnership(String facilityId) {
        vn.edu.fpt.eyesora.entity.User currentUser = vn.edu.fpt.eyesora.util.SecurityUtil.getCurrentUser();
        boolean isFacilityAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("FACILITY_ADMIN"));
        if (isFacilityAdmin) {
            if (currentUser.getFacility() == null || !currentUser.getFacility().getId().equals(facilityId)) {
                throw new org.springframework.security.access.AccessDeniedException("Không có quyền truy cập dữ liệu của cơ sở này");
            }
        }
    }


    private final EyeExamRecordRepository eyeExamRecordRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FacilitySelectResponse> getFacilityList() {
        return eyeExamRecordRepository.findByIsDeletedFalse().stream()
                .filter(e -> e.getClassesField() != null && e.getClassesField().getFacility() != null)
                .map(e -> e.getClassesField().getFacility())
                .distinct()
                .map(f -> new FacilitySelectResponse(f.getId(), f.getFacilityName()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacilityGradeMyopiaResponse> getFacilityGradeStats(String facilityId) {
        checkFacilityOwnership(facilityId);
        List<EyeExamRecord> records = eyeExamRecordRepository.findByIsDeletedFalse().stream()
                .filter(e -> e.getClassesField() != null
                        && e.getClassesField().getFacility() != null
                        && Objects.equals(e.getClassesField().getFacility().getId(), facilityId))
                .toList();

        Map<Integer, List<EyeExamRecord>> groupByGrade = records.stream()
                .filter(e -> e.getClassesField().getGrade() != null)
                .collect(Collectors.groupingBy(e -> e.getClassesField().getGrade()));

        List<FacilityGradeMyopiaResponse> gradeStats = new ArrayList<>();
        groupByGrade.forEach((grade, gradeRecords) -> {
            if (grade > 0) {
                long totalInGrade = gradeRecords.size();
                long myopiaInGrade = gradeRecords.stream()
                        .filter(e -> (e.getSphLeft() != null && e.getSphLeft() < 0)
                                || (e.getSphRight() != null && e.getSphRight() < 0))
                        .count();

                double rate = totalInGrade > 0 ? Math.round((myopiaInGrade * 100.0 / totalInGrade) * 10.0) / 10.0 : 0.0;
                gradeStats.add(new FacilityGradeMyopiaResponse("Khối " + grade, rate));
            }
        });

        gradeStats.sort(Comparator.comparing(FacilityGradeMyopiaResponse::gradeName));
        return gradeStats;
    }

    @Override
    @Transactional(readOnly = true)
    public FacilitySummaryResponse getFacilitySummary(String facilityId) {
        checkFacilityOwnership(facilityId);
        List<EyeExamRecord> records = eyeExamRecordRepository.findByIsDeletedFalse().stream()
                .filter(e -> e.getClassesField() != null
                        && e.getClassesField().getFacility() != null
                        && Objects.equals(e.getClassesField().getFacility().getId(), facilityId))
                .toList();

        long totalStudents = records.size();
        long totalAlertCases = records.stream()
                .filter(e -> (e.getSphLeft() != null && e.getSphLeft() <= -6.00)
                        || (e.getSphRight() != null && e.getSphRight() <= -6.00))
                .count();

        long totalMyopia = records.stream()
                .filter(e -> (e.getSphLeft() != null && e.getSphLeft() < 0)
                        || (e.getSphRight() != null && e.getSphRight() < 0))
                .count();

        double currentMyopiaRate = totalStudents > 0 ? Math.round((totalMyopia * 100.0 / totalStudents) * 10.0) / 10.0 : 0.0;

        return FacilitySummaryResponse.builder()
                .totalExaminedStudents(totalStudents)
                .currentMyopiaRate(currentMyopiaRate)
                .totalAlertCases(totalAlertCases)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacilityAlertRecordResponse> getFacilityAlertRecords(String facilityId) {
        checkFacilityOwnership(facilityId);
        return eyeExamRecordRepository.findByIsDeletedFalse().stream()
                .filter(e -> e.getClassesField() != null
                        && e.getClassesField().getFacility() != null
                        && Objects.equals(e.getClassesField().getFacility().getId(), facilityId))
                .filter(e -> (e.getSphLeft() != null && e.getSphLeft() <= -6.00)
                        || (e.getSphRight() != null && e.getSphRight() <= -6.00))
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());
    }

    private FacilityAlertRecordResponse mapToAlertResponse(EyeExamRecord entity) {
        String studentName = "N/A";
        String genderStr = "Khác";

        if (entity.getPatient() != null) {
            studentName = entity.getPatient().getPatientName() != null ? entity.getPatient().getPatientName() : "N/A";

            if (entity.getPatient().getGender() != null) {
                Patient.Gender genderEnum = entity.getPatient().getGender();
                if (genderEnum == Patient.Gender.MALE) {
                    genderStr = "Nam";
                } else if (genderEnum == Patient.Gender.FEMALE) {
                    genderStr = "Nữ";
                }
            }
        }

        String className = "-";
        Integer grade = 0;
        String facilityName = "-";

        if (entity.getClassesField() != null) {
            className = entity.getClassesField().getClassName() != null ? entity.getClassesField().getClassName() : "-";
            grade = entity.getClassesField().getGrade() != null ? entity.getClassesField().getGrade() : 0;

            if (entity.getClassesField().getFacility() != null) {
                facilityName = entity.getClassesField().getFacility().getFacilityName() != null
                        ? entity.getClassesField().getFacility().getFacilityName() : "-";
            }
        }

        String examIdStr = entity.getExamId() != null ? entity.getExamId() : "";

        Double sphLeftDouble = entity.getSphLeft() != null ? entity.getSphLeft().doubleValue() : null;
        Double sphRightDouble = entity.getSphRight() != null ? entity.getSphRight().doubleValue() : null;

        return FacilityAlertRecordResponse.builder()
                .examId(examIdStr)
                .studentName(studentName)
                .gender(genderStr)
                .className(className)
                .grade(grade)
                .facilityName(facilityName)
                .sphLeft(sphLeftDouble)
                .sphRight(sphRightDouble)
                .examDate(entity.getExamDate())
                .build();
    }
}