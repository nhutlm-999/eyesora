package vn.edu.fpt.eyesora.dto.response;

import java.util.Set;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String id,
        String name,
        String username,
        String img,
        Set<String> roles
) {}