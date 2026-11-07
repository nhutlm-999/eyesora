package vn.edu.fpt.eyesora.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WardRequest(
        @NotBlank(message = "Tên phường/xã không được để trống")
        @Size(max = 100, message = "Tên phường/xã không được vượt quá 100 ký tự")
        String wardName,

        @NotBlank(message = "Mã tỉnh/thành phố không được để trống")
        String provinceId
) {}
