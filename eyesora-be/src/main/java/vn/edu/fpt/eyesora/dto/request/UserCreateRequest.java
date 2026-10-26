package vn.edu.fpt.eyesora.dto.request;

import jakarta.validation.constraints.*;
import java.util.Set;

public record UserCreateRequest(
        @NotBlank(message = "Username không được để trống")
        @Size(min = 4, max = 50, message = "Username phải từ 4-50 ký tự")
        String username,

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu phải từ 6 ký tự trở lên")
        String password,

        @Email(message = "Email không đúng định dạng")
        String email,

        @NotBlank(message = "Họ tên không được để trống")
        String fullName,

        String facilityId,

        @NotEmpty(message = "Phải gán ít nhất một quyền (role)")
        Set<String> roleNames
) {}