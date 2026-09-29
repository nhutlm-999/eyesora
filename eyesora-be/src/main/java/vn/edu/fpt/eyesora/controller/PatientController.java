package vn.edu.fpt.eyesora.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import vn.edu.fpt.eyesora.dto.request.PatientRequest;
import vn.edu.fpt.eyesora.dto.response.PatientResponse;
import vn.edu.fpt.eyesora.service.IPatientService;

import java.util.Map;

@PreAuthorize("hasAnyRole('ADMIN', 'FACILITY_ADMIN', 'EXAMINER')")
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final IPatientService patientService;

    @GetMapping
    public ResponseEntity<Page<PatientResponse>> getPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer birthYear,
            @RequestParam(required = false) String classId,
            @RequestParam(required = false) String facilityId,
            @RequestHeader(value = "Ward-Id", required = false) String wardId) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(patientService.getPatients(wardId, name, birthYear, classId, facilityId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> getPatientDetail(@PathVariable String id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @GetMapping("/count/{campaignId}")
    public ResponseEntity<Map<String, Integer>> countPatients(@PathVariable String campaignId) {
        return ResponseEntity.ok(Map.of("count", patientService.countPatientsByCampaign(campaignId)));
    }

    @PostMapping
    public ResponseEntity<String> createPatient(@Valid @RequestBody PatientRequest req) {
        patientService.createPatient(req);
        return ResponseEntity.ok(
                "Tạo bệnh nhân thành công!");
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable String id,
            @Valid @RequestBody PatientRequest req) {

        PatientResponse updatedPatient = patientService.updatePatient(id, req);
        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePatient(@PathVariable String id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok("Đã xóa bệnh nhân thành công!");
    }
}