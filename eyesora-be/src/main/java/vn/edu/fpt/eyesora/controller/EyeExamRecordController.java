package vn.edu.fpt.eyesora.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.eyesora.dto.request.EyeExamRecordRequest;
import vn.edu.fpt.eyesora.dto.request.EyeExamRecordUpdateRequest;
import vn.edu.fpt.eyesora.dto.response.ExcelImportResponse;
import vn.edu.fpt.eyesora.dto.response.EyeExamRecordResponse;
import vn.edu.fpt.eyesora.service.IEyeExamRecordService;

import java.util.List;

@PreAuthorize("hasAnyRole('ADMIN', 'FACILITY_ADMIN', 'EXAMINER')")
@RestController
@RequestMapping("/api/eye-exam-records")
@RequiredArgsConstructor
public class EyeExamRecordController {

    private final IEyeExamRecordService eyeExamRecordService;

    @GetMapping
    public ResponseEntity<Page<EyeExamRecordResponse>> getExamRecords(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String facilityId,
            @RequestParam(required = false) String campaignId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("examDate").descending());

        Page<EyeExamRecordResponse> result = eyeExamRecordService.getExamRecords(keyword, facilityId, campaignId, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{examId}")
    public ResponseEntity<EyeExamRecordResponse> getExamRecordDetail(@PathVariable String examId) {
        EyeExamRecordResponse result = eyeExamRecordService.getExamRecordDetail(examId);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<EyeExamRecordResponse> createExamRecord(
            @Valid @RequestBody EyeExamRecordRequest request) {
        EyeExamRecordResponse response = eyeExamRecordService.createExamRecord(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/edit/{examId}")
    public ResponseEntity<EyeExamRecordResponse> updateExamRecord(
            @PathVariable String examId,
            @Valid @RequestBody EyeExamRecordUpdateRequest request) {
        EyeExamRecordResponse updatedRecord = eyeExamRecordService.updateExamRecord(examId, request);
        return ResponseEntity.ok(updatedRecord);
    }

    @DeleteMapping("/{examId}")
    public ResponseEntity<Void> deleteExamRecord(@PathVariable String examId) {
        eyeExamRecordService.deleteExamRecord(examId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<ExcelImportResponse> importExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "campaignId", required = false) String campaignId,
            @RequestParam(value = "examinerId", required = false) String examinerId,
            @RequestParam(value = "facilityId", required = false) String facilityId) {

        ExcelImportResponse result = eyeExamRecordService.importExamRecordsFromExcel(file, campaignId, examinerId, facilityId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<EyeExamRecordResponse>> getExamRecordByPatient(
            @PathVariable String patientId) {

        List<EyeExamRecordResponse> records =
                eyeExamRecordService.getByPatientId(patientId);

        System.out.println(records);

        return records.isEmpty()
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(records);
    }
}