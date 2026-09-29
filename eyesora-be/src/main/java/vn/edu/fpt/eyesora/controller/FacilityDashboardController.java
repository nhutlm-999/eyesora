package vn.edu.fpt.eyesora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import vn.edu.fpt.eyesora.dto.response.FacilityGradeMyopiaResponse;
import vn.edu.fpt.eyesora.dto.response.FacilitySelectResponse;
import vn.edu.fpt.eyesora.dto.response.FacilitySummaryResponse;
import vn.edu.fpt.eyesora.entity.EyeExamRecord;
import vn.edu.fpt.eyesora.service.IFacilityDashboardService;

import java.util.List;

@PreAuthorize("hasRole('FACILITY_ADMIN')")
@RestController
@RequestMapping("/api/dashboard/facility")
@RequiredArgsConstructor
public class FacilityDashboardController {

    private final IFacilityDashboardService facilityDashboardService;

    @GetMapping("/list")
    public ResponseEntity<List<FacilitySelectResponse>> getFacilityList() {
        return ResponseEntity.ok(facilityDashboardService.getFacilityList());
    }

    @GetMapping("/grade-stats")
    public ResponseEntity<List<FacilityGradeMyopiaResponse>> getFacilityGradeStats(@RequestParam String facilityId) {
        return ResponseEntity.ok(facilityDashboardService.getFacilityGradeStats(facilityId));
    }

    @GetMapping("/summary")
    public ResponseEntity<FacilitySummaryResponse> getFacilitySummary(@RequestParam String facilityId) {
        return ResponseEntity.ok(facilityDashboardService.getFacilitySummary(facilityId));
    }

    @GetMapping("/alert-records")
    public ResponseEntity<List<vn.edu.fpt.eyesora.dto.response.FacilityAlertRecordResponse>> getFacilityAlertRecords(@RequestParam String facilityId) {
        return ResponseEntity.ok(facilityDashboardService.getFacilityAlertRecords(facilityId));
    }
}