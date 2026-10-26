package vn.edu.fpt.eyesora.service;

import vn.edu.fpt.eyesora.dto.response.FacilityAlertRecordResponse;
import vn.edu.fpt.eyesora.dto.response.FacilityGradeMyopiaResponse;
import vn.edu.fpt.eyesora.dto.response.FacilitySelectResponse;
import vn.edu.fpt.eyesora.dto.response.FacilitySummaryResponse;
import java.util.List;

public interface IFacilityDashboardService {
    List<FacilitySelectResponse> getFacilityList();
    List<FacilityGradeMyopiaResponse> getFacilityGradeStats(String facilityId);
    FacilitySummaryResponse getFacilitySummary(String facilityId);
    List<FacilityAlertRecordResponse> getFacilityAlertRecords(String facilityId);
}