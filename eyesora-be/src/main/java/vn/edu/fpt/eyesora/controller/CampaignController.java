package vn.edu.fpt.eyesora.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import vn.edu.fpt.eyesora.dto.request.CampaignRequest;
import vn.edu.fpt.eyesora.dto.response.CampaignResponse;
import vn.edu.fpt.eyesora.service.ICampaignService;
import vn.edu.fpt.eyesora.service.IPatientService;

import java.util.List;
import java.util.Map;

@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {
    private final ICampaignService campaignService;
    private final IPatientService patientService;

//    @GetMapping
//    public ResponseEntity<?> getAll() {
//        return ResponseEntity.ok(campaignService.getAllCampaigns());
//    }

    @GetMapping
    public ResponseEntity<Page<CampaignResponse>> getAllCampaigns(
            @PageableDefault(size = 10, sort = "startDate") Pageable pageable,
            @RequestParam(required = false) String status
            ) {
        return ResponseEntity.ok(campaignService.getAllCampaigns(status, pageable));
    }

    @GetMapping("/{campaignId}/patient-count")
    public ResponseEntity<?> getPatientCountForCampaign(@PathVariable String campaignId) {
        return ResponseEntity.ok(Map.of("count", patientService.countPatientsByCampaign(campaignId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignResponse> getCampaignDetail(@PathVariable String id) {
        return ResponseEntity.ok(campaignService.getCampaignDetail(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CampaignRequest req) {
        try {
            return ResponseEntity.ok(campaignService.createCampaign(req));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @PathVariable String status) {
        campaignService.setCampaignStatus(id, status);
        return ResponseEntity.ok("Trạng thái đã được cập nhật thành: " + status);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCampaign(@PathVariable String id, @Valid @RequestBody CampaignRequest req) {
        if (req.startDate() != null && req.endDate() != null && req.startDate().isAfter(req.endDate())) {
            return ResponseEntity.badRequest().body(Map.of("startDate", "Ngày bắt đầu phải trước ngày kết thúc",
                    "endDate", "Ngày kết thúc phải sau ngày bắt đầu"));
        }

        return ResponseEntity.ok(campaignService.updateCampaign(id, req));
    }

//    @GetMapping("/deleted")
//    public ResponseEntity<Page<CampaignResponse>> getDeletedCampaigns(
//            @PageableDefault(size = 10, sort = "startDate") Pageable pageable) {
//        return ResponseEntity.ok(campaignService.getDeletedCampaigns(pageable));
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable String id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }
}