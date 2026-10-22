package vn.edu.fpt.eyesora.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.edu.fpt.eyesora.dto.request.PatientRequest;
import vn.edu.fpt.eyesora.dto.response.OverduePatientResponse;
import vn.edu.fpt.eyesora.dto.response.PatientResponse;
import vn.edu.fpt.eyesora.entity.Patient;

public interface IPatientService {
    Page<PatientResponse> getPatients(String wardId, String name, Integer birthYear, String classId, String facilityId, Pageable pageable);
    PatientResponse getPatientById(String id);
    void createPatient(PatientRequest req);
    Integer countPatientsByCampaign(String campaignId);
    PatientResponse updatePatient(String id, PatientRequest req);
    void deletePatient(String id);
    Page<OverduePatientResponse> getOverdueReExamPatients(String keyword, String facilityId, Integer overdueMonths, Pageable pageable);
}