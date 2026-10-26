package vn.edu.fpt.eyesora.dto.response;

import java.util.Set;

public record UserResponse(
        String id,
        String username,
        String email,
        String fullName,
        String status,
        Set<String> roles,
        String facilityName,
        String facilityId
) {}