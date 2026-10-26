package vn.edu.fpt.eyesora.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.eyesora.dto.request.EyeExamRecordRequest;
import vn.edu.fpt.eyesora.dto.request.EyeExamRecordUpdateRequest;
import vn.edu.fpt.eyesora.dto.response.ExcelImportResponse;
import vn.edu.fpt.eyesora.dto.response.EyeExamRecordResponse;

import java.util.List;

public interface IEyeExamRecordService {
    Page<EyeExamRecordResponse> getExamRecords(String keyword, String facilityId, String campaignId, Pageable pageable);
    EyeExamRecordResponse updateExamRecord(String examId, EyeExamRecordUpdateRequest request);
    EyeExamRecordResponse createExamRecord(EyeExamRecordRequest request);
    EyeExamRecordResponse getExamRecordDetail(String examId);
    void deleteExamRecord(String examId);
    ExcelImportResponse importExamRecordsFromExcel(MultipartFile file, String campaignId, String examinerId, String facilityId);
    List<EyeExamRecordResponse> getByPatientId(String patientId);
}