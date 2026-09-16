package vn.edu.fpt.eyesora.service;

import vn.edu.fpt.eyesora.dto.response.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import java.io.ByteArrayInputStream;
import java.util.List;

public interface IDashboardService {
    DashboardSummaryResponse getSummaryCounters();
    List<GradeMyopiaResponse> getGradeStats();
//    List<MyopiaTimelineResponse> getMyopiaTimeline();
    List<FacilityMyopiaResponse> getFacilityStats();

    ByteArrayInputStream  exportDashboardReport();

    Page<EyeExamRecordResponse> getCriticalAlerts(String statusFilter, Pageable pageable);
}