package vn.edu.fpt.eyesora.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import vn.edu.fpt.eyesora.dto.request.*;
import vn.edu.fpt.eyesora.dto.response.*;
import vn.edu.fpt.eyesora.service.IAddressService;
import vn.edu.fpt.eyesora.service.IClassesService;
import vn.edu.fpt.eyesora.service.IFacilityService;

@PreAuthorize("hasAnyRole('ADMIN', 'FACILITY_ADMIN', 'EXAMINER')")
@RestController
@RequestMapping("/api/master-data")
@RequiredArgsConstructor
public class MasterDataController {
    private final IAddressService addressService;
    private final IFacilityService facilityService;
    private final IClassesService classesService;

    // --- Districts ---
    @GetMapping("/districts")
    public ResponseEntity<PageResponse<DistrictResponse>> getAllDistricts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(PageResponse.from(addressService.getAllDistricts(PageRequest.of(page, size))));
    }

    @GetMapping("/districts/{id}")
    public ResponseEntity<DistrictResponse> getDistrictById(@PathVariable String id) {
        return ResponseEntity.ok(addressService.getDistrictById(id));
    }

    @PostMapping("/districts")
    public ResponseEntity<DistrictResponse> createDistrict(@Valid @RequestBody DistrictRequest req) {
        return ResponseEntity.ok(addressService.createDistrict(req));
    }

    @PutMapping("/districts/{id}")
    public ResponseEntity<DistrictResponse> updateDistrict(@PathVariable String id, @Valid @RequestBody DistrictRequest req) {
        return ResponseEntity.ok(addressService.updateDistrict(id, req));
    }

    // --- Wards ---
    @GetMapping("/wards")
    public ResponseEntity<PageResponse<WardResponse>> getAllWards(
            @RequestParam(required = false) String districtId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(PageResponse.from(addressService.getAllWards(districtId, PageRequest.of(page, size))));
    }

    @GetMapping("/wards/{id}")
    public ResponseEntity<WardResponse> getWardById(@PathVariable String id) {
        return ResponseEntity.ok(addressService.getWardById(id));
    }

    @PostMapping("/wards")
    public ResponseEntity<WardResponse> createWard(@Valid @RequestBody WardRequest req) {
        return ResponseEntity.ok(addressService.createWard(req));
    }

    @PutMapping("/wards/{id}")
    public ResponseEntity<WardResponse> updateWard(@PathVariable String id, @Valid @RequestBody WardRequest req) {
        return ResponseEntity.ok(addressService.updateWard(id, req));
    }

    // --- Facilities ---
    @GetMapping("/facilities")
    public ResponseEntity<PageResponse<FacilityResponse>> getFacilities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "facilityName") String sortBy) {
        return ResponseEntity.ok(PageResponse.from(facilityService.getAllFacilities(PageRequest.of(page, size, Sort.by(sortBy)))));
    }

    @GetMapping("/facilities/{id}")
    public ResponseEntity<FacilityResponse> getFacilityDetail(@PathVariable String id) {
        return ResponseEntity.ok(facilityService.getFacilityDetail(id));
    }

    @PostMapping("/facilities")
    public ResponseEntity<FacilityResponse> createFacility(@Valid @RequestBody FacilityRequest req) {
        return ResponseEntity.ok(facilityService.createFacility(req));
    }

    @PutMapping("/facilities/{id}")
    public ResponseEntity<FacilityResponse> updateFacility(@PathVariable String id, @Valid @RequestBody FacilityRequest req) {
        return ResponseEntity.ok(facilityService.updateFacility(id, req));
    }

    // --- Classes ---
    @GetMapping("/classes")
    public ResponseEntity<PageResponse<ClassesResponse>> getAllClasses(
            @PageableDefault(size = 10, sort = "className") Pageable pageable) {
        return ResponseEntity.ok(PageResponse.from(classesService.getAllClasses(pageable)));
    }

    @PostMapping("/classes")
    public ResponseEntity<ClassesResponse> createClass(@Valid @RequestBody ClassesRequest req) {
        return ResponseEntity.ok(classesService.createClass(req));
    }

    @PutMapping("/classes/{id}")
    public ResponseEntity<ClassesResponse> updateClass(@PathVariable String id, @Valid @RequestBody ClassesRequest req) {
        return ResponseEntity.ok(classesService.updateClass(id, req));
    }

    @GetMapping("/classes/{id}/patients")
    public ResponseEntity<ClassDetailResponse> getClassDetail(
            @PathVariable String id,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(classesService.getClassDetail(id, pageable));
    }

    @GetMapping("/classes/{id}")
    public ResponseEntity<ClassesResponse> getClassById(@PathVariable String id) {
        return ResponseEntity.ok(classesService.getClassById(id));
    }

    @DeleteMapping("/classes/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable String id) {
        classesService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }
}