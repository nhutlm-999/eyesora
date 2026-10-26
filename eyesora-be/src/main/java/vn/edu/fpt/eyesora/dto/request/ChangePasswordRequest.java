package vn.edu.fpt.eyesora.dto.request;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Mật khẩu cũ là bắt buộc")
    private String oldPassword;

    @NotBlank(message = "Mật khẩu mới là bắt buộc")
    private String newPassword;

    @NotBlank(message = "Xác nhận mật khẩu mới là bắt buộc")
    private String confirmPassword;
}