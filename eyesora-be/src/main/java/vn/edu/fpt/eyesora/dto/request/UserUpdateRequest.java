package vn.edu.fpt.eyesora.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record UserUpdateRequest(
        @NotBlank(message = "Họ tên không được để trống")
        String fullName,

        @Email(message = "Email không đúng định dạng")
        String email,
        
        @NotEmpty(message = "Phải gán ít nhất một quyền (role)")
        Set<String> roleNames,
        String facilityId
) {}