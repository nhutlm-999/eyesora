package vn.edu.fpt.eyesora.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.eyesora.dto.request.FacilityRequest;
import vn.edu.fpt.eyesora.dto.response.FacilityResponse;
import vn.edu.fpt.eyesora.entity.Facility;
import vn.edu.fpt.eyesora.entity.Ward;
import vn.edu.fpt.eyesora.exceptions.ResourceNotFoundException;
import vn.edu.fpt.eyesora.repository.FacilityRepository;
import vn.edu.fpt.eyesora.repository.WardRepository;
import vn.edu.fpt.eyesora.service.IFacilityService;

@Service
@RequiredArgsConstructor
@Transactional
public class FacilityServiceImpl implements IFacilityService {
    private final FacilityRepository facilityRepository;
    private final WardRepository wardRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<FacilityResponse> getAllFacilities(Pageable pageable) {
        return facilityRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public FacilityResponse createFacility(FacilityRequest req) {
        Facility f = new Facility();
        if (req.wardId() != null && !req.wardId().isBlank()) {
            Ward ward = wardRepository.findById(req.wardId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phường/xã"));
            f.setWard(ward);
        }

        f.setFacilityName(req.facilityName());
        f.setFacilityType(req.facilityType());
        f.setAddress(req.address());
        f.setPhone(req.phone());
        f.setGoogleMapsUrl(req.googleMapsUrl());

        f = facilityRepository.save(f);
        return mapToResponse(f);
    }

    @Override
    public FacilityResponse updateFacility(String id, FacilityRequest req) {
        Facility existing = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở với ID: " + id));

        existing.setFacilityName(req.facilityName());
        existing.setFacilityType(req.facilityType());
        existing.setAddress(req.address());
        existing.setPhone(req.phone());
        existing.setGoogleMapsUrl(req.googleMapsUrl());

        // Kiểm tra an toàn: Lấy ID ward hiện tại nếu có
        String currentWardId = (existing.getWard() != null) ? existing.getWard().getId() : null;

        // Chỉ cập nhật Ward nếu có wardId mới và khác với wardId hiện tại
        if (req.wardId() != null && !req.wardId().isBlank()) {
            if (!req.wardId().equals(currentWardId)) {
                Ward newWard = wardRepository.findById(req.wardId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phường/xã với ID: " + req.wardId()));
                existing.setWard(newWard);
            }
        } else {
            // Nếu gửi wardId rỗng/null, xóa ward khỏi cơ sở
            existing.setWard(null);
        }

        return mapToResponse(facilityRepository.save(existing));
    }

    private FacilityResponse mapToResponse(Facility f) {
        // Kiểm tra null ở mọi cấp độ để tránh NullPointerException
        String wardName = (f.getWard() != null) ? f.getWard().getWardName() : null;
        String wardId = (f.getWard() != null) ? f.getWard().getId() : null;

        // Kiểm tra District: chỉ lấy ID nếu Ward và District tồn tại
        String districtId = (f.getWard() != null && f.getWard().getDistrict() != null)
                ? f.getWard().getDistrict().getId() : null;

        return new FacilityResponse(
                f.getId(),
                f.getFacilityName(),
                f.getFacilityType(),
                f.getAddress(),
                f.getPhone(),
                wardName,
                wardId,
                districtId,
                f.getGoogleMapsUrl()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public FacilityResponse getFacilityDetail(String facilityId) {
        Facility facility = facilityRepository.findWithDetailById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở"));

        return mapToResponse(facility);
    }
}
