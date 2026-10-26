package vn.edu.fpt.eyesora.service.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import vn.edu.fpt.eyesora.entity.User;
import vn.edu.fpt.eyesora.util.SecurityUtil;

@Component
public class FacilityScopeResolver {

    private static final String FACILITY_ADMIN = "ROLE_FACILITY_ADMIN";

    /**
     * ADMIN: trả về facilityId yêu cầu (null = toàn hệ thống).
     * FACILITY_ADMIN: luôn ép về cơ sở của chính mình; yêu cầu cơ sở khác sẽ bị từ chối.
     */
    public String resolve(String requestedFacilityId) {
        User user = SecurityUtil.getCurrentUser();
        String requested = (requestedFacilityId == null || requestedFacilityId.isBlank())
                ? null : requestedFacilityId;

        boolean isFacilityAdmin = user.getAuthorities().stream()
                .anyMatch(a -> FACILITY_ADMIN.equals(a.getAuthority()));
        if (!isFacilityAdmin) {
            return requested;
        }

        if (user.getFacility() == null) {
            throw new AccessDeniedException("Tài khoản chưa được gán cơ sở trường học");
        }
        String own = user.getFacility().getId();
        if (requested != null && !requested.equals(own)) {
            throw new AccessDeniedException("Không có quyền truy cập dữ liệu của cơ sở này");
        }
        return own;
    }
}
