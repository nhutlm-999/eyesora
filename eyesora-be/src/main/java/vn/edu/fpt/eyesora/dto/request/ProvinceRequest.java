package vn.edu.fpt.eyesora.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProvinceRequest(
        @NotBlank(message = "Tên tỉnh/thành phố không được để trống")
        @Size(max = 100, message = "Tên tỉnh/thành phố không được vượt quá 100 ký tự")
        String provinceName
) {}
