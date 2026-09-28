package vn.edu.fpt.eyesora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.fpt.eyesora.dto.response.*;
import vn.edu.fpt.eyesora.service.IDashboardService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.io.ByteArrayInputStream;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final IDashboardService dashboardService;

    @GetMapping("/counters")
    public ResponseEntity<DashboardSummaryResponse> getSummaryCounters(
            @RequestParam(required = false) java.time.LocalDate startDate,
            @RequestParam(required = false) java.time.LocalDate endDate,
            @RequestParam(required = false) String campaignId) {
        return ResponseEntity.ok(dashboardService.getSummaryCounters(startDate, endDate, campaignId));
    }

    @GetMapping("/grade-stats")
    public ResponseEntity<List<GradeMyopiaResponse>> getGradeStats(
            @RequestParam(required = false) java.time.LocalDate startDate,
            @RequestParam(required = false) java.time.LocalDate endDate,
            @RequestParam(required = false) String campaignId) {
        return ResponseEntity.ok(dashboardService.getGradeStats(startDate, endDate, campaignId));
    }

    @GetMapping("/myopia-timeline")
    public ResponseEntity<List<MyopiaTimelineResponse>> getMyopiaTimeline(
            @RequestParam(required = false) java.time.LocalDate startDate,
            @RequestParam(required = false) java.time.LocalDate endDate,
            @RequestParam(required = false) String campaignId) {
        return ResponseEntity.ok(dashboardService.getMyopiaTimeline(startDate, endDate, campaignId));
    }

    @GetMapping("/facility-stats")
    public ResponseEntity<List<FacilityMyopiaResponse>> getFacilityStats(
            @RequestParam(required = false) java.time.LocalDate startDate,
            @RequestParam(required = false) java.time.LocalDate endDate,
            @RequestParam(required = false) String campaignId) {
        return ResponseEntity.ok(dashboardService.getFacilityStats(startDate, endDate, campaignId));
    }

    @GetMapping("/export/city")
    public ResponseEntity<InputStreamResource> exportCityReport() {
        ByteArrayInputStream in = dashboardService. exportDashboardReport();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Bao_Cao_Tu_EyeSora.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/critical-alerts")
    public ResponseEntity<Page<EyeExamRecordResponse>> getCriticalAlerts(
            @RequestParam(defaultValue = "ALL") String statusFilter,
            @RequestParam(required = false) java.time.LocalDate startDate,
            @RequestParam(required = false) java.time.LocalDate endDate,
            @RequestParam(required = false) String campaignId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(dashboardService.getCriticalAlerts(statusFilter, startDate, endDate, campaignId, pageable));
    }

    @GetMapping("/drilldown")
    public ResponseEntity<?> getDrillDown(
            @RequestParam(required = false) java.time.LocalDate startDate,
            @RequestParam(required = false) java.time.LocalDate endDate,
            @RequestParam(required = false) String campaignId) {
        return ResponseEntity.ok(dashboardService.getDrillDown(startDate, endDate, campaignId));
    }
}