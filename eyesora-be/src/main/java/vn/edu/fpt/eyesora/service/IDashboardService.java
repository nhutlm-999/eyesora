package vn.edu.fpt.eyesora.service;

import vn.edu.fpt.eyesora.dto.response.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import java.io.ByteArrayInputStream;
import java.util.List;

import java.time.LocalDate;

public interface IDashboardService {
    DashboardSummaryResponse getSummaryCounters(LocalDate startDate, LocalDate endDate, String campaignId);
    List<GradeMyopiaResponse> getGradeStats(LocalDate startDate, LocalDate endDate, String campaignId);
    List<MyopiaTimelineResponse> getMyopiaTimeline(LocalDate startDate, LocalDate endDate, String campaignId);
    List<FacilityMyopiaResponse> getFacilityStats(LocalDate startDate, LocalDate endDate, String campaignId);
    
    Object getDrillDown(LocalDate startDate, LocalDate endDate, String campaignId);

    ByteArrayInputStream exportDashboardReport();

    Page<EyeExamRecordResponse> getCriticalAlerts(String statusFilter, LocalDate startDate, LocalDate endDate, String campaignId, Pageable pageable);
}