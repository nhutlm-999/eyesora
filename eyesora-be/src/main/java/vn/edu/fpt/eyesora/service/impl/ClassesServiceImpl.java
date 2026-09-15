package vn.edu.fpt.eyesora.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.eyesora.dto.request.ClassesRequest;
import vn.edu.fpt.eyesora.dto.response.ClassDetailResponse;
import vn.edu.fpt.eyesora.dto.response.ClassesResponse;
import vn.edu.fpt.eyesora.dto.response.PatientResponse;
import vn.edu.fpt.eyesora.entity.*;
import vn.edu.fpt.eyesora.exceptions.BusinessException;
import vn.edu.fpt.eyesora.exceptions.ResourceNotFoundException;
import vn.edu.fpt.eyesora.repository.ClassEnrollmentRepository;
import vn.edu.fpt.eyesora.repository.ClassesRepository;
import vn.edu.fpt.eyesora.repository.FacilityRepository;
import vn.edu.fpt.eyesora.service.IClassesService;
import vn.edu.fpt.eyesora.util.SecurityUtil;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClassesServiceImpl implements IClassesService {

    private final ClassesRepository classesRepository;
    private final FacilityRepository facilityRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository; // Inject repository bảng trung gian

    @Override
    @Transactional(readOnly = true)
    public Page<ClassesResponse> getAllClasses(Pageable pageable) {
        User currentUser = SecurityUtil.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated");
        }

        boolean isFacilityAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_FACILITY_ADMIN"));

        boolean isSystemAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        Specification<Classes> spec = (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("isDeleted"), false));

            if (isSystemAdmin) {
                // Toàn quyền xem tất cả
            } else if (isFacilityAdmin) {
                String userFacilityId = currentUser.getFacility().getId();
                predicates.add(criteriaBuilder.equal(root.get("facility").get("id"), userFacilityId));
            } else {
                return criteriaBuilder.disjunction();
            }

            return criteriaBuilder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return classesRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ClassesResponse getClassById(String id) {
        return classesRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với ID: " + id));
    }

    @Override
    public ClassesResponse createClass(ClassesRequest req) {
        Facility facility = facilityRepository.findById(req.facilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở với ID: " + req.facilityId()));

        Classes newClass = new Classes();
        newClass.setFacility(facility);
        newClass.setClassName(req.className());
        newClass.setGrade(req.grade());
        newClass.setSchoolYear(req.schoolYear());

        Classes saved = classesRepository.save(newClass);
        return mapToResponse(saved);
    }

    @Override
    public ClassesResponse updateClass(String id, ClassesRequest req) {
        Classes existing = classesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với ID: " + id));

        if (req.facilityId() != null && !req.facilityId().equals(existing.getFacility().getId())) {
            Facility newFacility = facilityRepository.findById(req.facilityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở với ID: " + req.facilityId()));
            existing.setFacility(newFacility);
        }

        existing.setClassName(req.className());
        existing.setGrade(req.grade());
        existing.setSchoolYear(req.schoolYear());

        return mapToResponse(classesRepository.save(existing));
    }

    @Override
    @Transactional(readOnly = true)
    public ClassDetailResponse getClassDetail(String classId, Pageable pageable) {
        Classes cls = classesRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với ID: " + classId));

        // Phân trang trực tiếp từ bảng trung gian dưới database
        Page<ClassEnrollment> enrollmentPage = classEnrollmentRepository.findActiveEnrollmentsByClassId(
                classId,
                ClassEnrollment.EnrollmentStatus.ACTIVE,
                pageable
        );

        // Map từng Enrollment -> Patient -> PatientResponse
        Page<PatientResponse> patientResponsePage = enrollmentPage.map(enrollment -> {
            Patient p = enrollment.getPatient();
            return new PatientResponse(
                    p.getPatientId(),
                    p.getPatientName(),
                    p.getFacility() != null ? p.getFacility().getId() : null,
                    p.getFacility() != null ? p.getFacility().getFacilityName() : null,
                    p.getDob(),
                    p.getGender() != null ? p.getGender().name() : "Chưa cập nhật",
                    p.getParentPhone(),
                    p.getWard() != null ? p.getWard().getId() : null,
                    p.getWard() != null ? p.getWard().getWardName() : "Chưa cập nhật"
            );
        });

        return new ClassDetailResponse(
                cls.getId(),
                cls.getClassName(),
                cls.getGrade(),
                cls.getPatientCount() != null ? cls.getPatientCount() : enrollmentPage.getTotalElements(),
                patientResponsePage
        );
    }

    @Override
    public void deleteClass(String id) {
        Classes classes = classesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với ID: " + id));

        // Kiểm tra tồn tại học sinh qua bảng enrollment thay vì classes.getPatients()
        boolean hasActiveStudents = classEnrollmentRepository.existsByClasses_IdAndStatus(
                id,
                ClassEnrollment.EnrollmentStatus.ACTIVE
        );

        if (hasActiveStudents) {
            throw new BusinessException("Không thể xóa lớp đang có học sinh. Vui lòng chuyển học sinh sang lớp khác trước.");
        }

        classes.setDeleted(true);
        classesRepository.save(classes);
    }

    private ClassesResponse mapToResponse(Classes c) {
        return new ClassesResponse(
                c.getId(),
                c.getFacility() != null ? c.getFacility().getFacilityName() : "Chưa cập nhật",
                c.getClassName(),
                c.getGrade(),
                c.getSchoolYear()
        );
    }
}