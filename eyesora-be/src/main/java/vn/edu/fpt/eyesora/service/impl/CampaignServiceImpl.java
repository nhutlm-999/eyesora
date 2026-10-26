package vn.edu.fpt.eyesora.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.eyesora.dto.request.CampaignRequest;
import vn.edu.fpt.eyesora.dto.response.CampaignResponse;
import vn.edu.fpt.eyesora.entity.ExamCampaign;
import vn.edu.fpt.eyesora.entity.Facility;
import vn.edu.fpt.eyesora.exceptions.BadRequestException;
import vn.edu.fpt.eyesora.exceptions.BusinessException;
import vn.edu.fpt.eyesora.exceptions.ResourceNotFoundException;
import vn.edu.fpt.eyesora.repository.CampaignRepository;
import vn.edu.fpt.eyesora.repository.FacilityRepository;
import vn.edu.fpt.eyesora.service.ICampaignService;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class CampaignServiceImpl implements ICampaignService {

    private final CampaignRepository campaignRepository;
    private final FacilityRepository facilityRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<CampaignResponse> getAllCampaigns(String status, Pageable pageable) {
        if (status != null && !status.isEmpty()) {
            try {
                ExamCampaign.CampaignStatus campaignStatus = ExamCampaign.CampaignStatus.valueOf(status.toUpperCase());
                return campaignRepository.findByStatus(campaignStatus, pageable)
                        .map(this::mapToResponse);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Trạng thái không hợp lệ: " + status);
            }
        }
        return campaignRepository.findByStatusNot(ExamCampaign.CampaignStatus.DELETED, pageable)
                .map(this::mapToResponse);
    }

//    @Override
//    public CampaignResponse createCampaign(CampaignRequest req) {
//        if (req.orgId() == null || req.targetId() == null) {
//            throw new BusinessException("Vui lòng chọn đầy đủ Tổ chức và Cơ sở đích.");
//        }
//
//        if (req.startDate() == null || req.endDate() == null || req.startDate().isAfter(req.endDate())) {
//            throw new BadRequestException("Ngày bắt đầu phải diễn ra trước ngày kết thúc.");
//        }
//
//        boolean exists = campaignRepository.existsByTargetfacility_IdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
//                req.targetId(), req.endDate(), req.startDate());
//
//        if (exists) {
//            throw new BusinessException("Chiến dịch bị trùng lịch tại cơ sở này!");
//        }
//
//        Facility org = facilityRepository.findById(req.orgId())
//                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức: " + req.orgId()));
//        Facility target = facilityRepository.findById(req.targetId())
//                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở: " + req.targetId()));
//
//        if (org.getFacilityType() == Facility.FacilityType.SCHOOL) {
//            throw new BusinessException("Tổ chức phải là Cơ sở Y tế.");
//        }
//
//        ExamCampaign campaign = new ExamCampaign();
//        campaign.setCampaignTitle(req.title());
//        campaign.setFacilityYear(req.year());
//        campaign.setStartDate(req.startDate());
//        campaign.setEndDate(req.endDate());
//        campaign.setManagerName(req.managerName());
//        campaign.setStatus(ExamCampaign.CampaignStatus.ACTIVE);
//        campaign.setOrganization(org);
//        campaign.setTargetfacility(target);
//
//        return mapToResponse(campaignRepository.save(campaign));
//    }

    @Override
    @Transactional
    public CampaignResponse createCampaign(CampaignRequest req) {
        // 1. Validate bắt buộc trường Title
        if (req.title() == null || req.title().isBlank()) {
            throw new BadRequestException("Tiêu đề chiến dịch không được để trống.");
        }

        // 2. Xử lý logic Ngày tháng (Cho phép null, nếu có 1 trong 2 thì gán bằng nhau)
        LocalDate startDate = req.startDate();
        LocalDate endDate = req.endDate();

        if (startDate != null && endDate == null) {
            endDate = startDate;
        } else if (startDate == null && endDate != null) {
            startDate = endDate;
        }

        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BadRequestException("Ngày bắt đầu phải diễn ra trước hoặc bằng ngày kết thúc.");
        }

        // 3. Kiểm tra trùng lịch (Chỉ check nếu có đầy đủ thông tin cơ sở đích và ngày tháng)
        if (req.targetId() != null && startDate != null && endDate != null) {
            boolean exists = campaignRepository.existsByTargetfacility_IdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                    req.targetId(), endDate, startDate);
            if (exists) {
                throw new BusinessException("Chiến dịch bị trùng lịch tại cơ sở này!");
            }
        }

        // 4. Khởi tạo Object và map dữ liệu từ Request
        ExamCampaign campaign = new ExamCampaign();
        campaign.setCampaignTitle(req.title());
        campaign.setFacilityYear(req.year());
        campaign.setStartDate(startDate);
        campaign.setEndDate(endDate);
        campaign.setManagerName(req.managerName());
        campaign.setStatus(ExamCampaign.CampaignStatus.ACTIVE);

        // 5. Xử lý Tổ chức (Organization) - Chỉ validate loại cơ sở nếu truyền orgId
        if (req.orgId() != null) {
            Facility org = facilityRepository.findById(req.orgId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức với ID: " + req.orgId()));

            // Bắt buộc phải có FacilityType và phải là Cơ sở Y tế
            if (org.getFacilityType() == null || org.getFacilityType() == Facility.FacilityType.SCHOOL) {
                throw new BusinessException("Tổ chức phải là Cơ sở Y tế.");
            }
            campaign.setOrganization(org);
        }

        // 6. Xử lý Cơ sở đích (Target Facility)
        if (req.targetId() != null) {
            Facility target = facilityRepository.findById(req.targetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở đích với ID: " + req.targetId()));
            campaign.setTargetfacility(target);
        }

        // 7. Lưu và trả về response
        return mapToResponse(campaignRepository.save(campaign));
    }

    @Override
    public CampaignResponse updateCampaign(String id, CampaignRequest req) {
        ExamCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch: " + id));

        if (req.startDate() == null || req.endDate() == null || req.startDate().isAfter(req.endDate())) {
            throw new BadRequestException("Ngày bắt đầu phải trước ngày kết thúc.");
        }

        boolean exists = campaignRepository.existsByTargetfacility_IdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndCampaignIdNot(
                req.targetId(), req.endDate(), req.startDate(), id);

        if (exists) {
            throw new BusinessException("Chiến dịch bị trùng lịch tại cơ sở này!");
        }

        Facility org = facilityRepository.findById(req.orgId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức: " + req.orgId()));

        Facility target = facilityRepository.findById(req.targetId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở: " + req.targetId()));

        campaign.setOrganization(org);
        campaign.setTargetfacility(target);

        campaign.setCampaignTitle(req.title());
        campaign.setFacilityYear(req.year());
        campaign.setStartDate(req.startDate());
        campaign.setEndDate(req.endDate());
        campaign.setManagerName(req.managerName());

        return mapToResponse(campaignRepository.save(campaign));
    }

    @Override
    public void setCampaignStatus(String id, String statusStr) {
        ExamCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch với ID: " + id));

        try {
            ExamCampaign.CampaignStatus newStatus = ExamCampaign.CampaignStatus.valueOf(statusStr.toUpperCase());
            campaign.setStatus(newStatus);
            campaignRepository.save(campaign);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Trạng thái không hợp lệ: " + statusStr);
        }
    }

    @Override
    public void deleteCampaign(String id) {
        ExamCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch"));

        campaign.setStatus(ExamCampaign.CampaignStatus.DELETED);
        campaignRepository.save(campaign);
    }

    private CampaignResponse mapToResponse(ExamCampaign c) {
        Long count = campaignRepository.countPatientsByCampaignId(c.getCampaignId());
        return CampaignResponse.builder()
                .campaignId(c.getCampaignId())
                .campaignTitle(c.getCampaignTitle())
                .facilityYear(c.getFacilityYear())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .managerName(c.getManagerName())
                .status(c.getStatus().name())
                .organizationName(c.getOrganization() != null ? c.getOrganization().getFacilityName() : null)
                .targetFacilityName(c.getTargetfacility() != null ? c.getTargetfacility().getFacilityName() : null)
                .patientCount(count != null ? count : 0L)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CampaignResponse getCampaignDetail(String id) {
        ExamCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch"));
        return mapToResponse(campaign);
    }
}