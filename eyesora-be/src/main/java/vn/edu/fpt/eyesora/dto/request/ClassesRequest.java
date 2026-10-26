package vn.edu.fpt.eyesora.dto.request;

import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.Range;

public record ClassesRequest(
        @NotBlank(message = "Mã cơ sở là bắt buộc")
        String facilityId,

        @NotBlank(message = "Tên lớp là bắt buộc")
        @Size(max = 50, message = "Tên lớp không được vượt quá 50 ký tự")
        String className,

        @NotNull(message = "Khối lớp là bắt buộc")
        @Range(min = 1, max = 12, message = "Khối lớp phải từ 1 đến 12")
        Integer grade,

        @NotBlank(message = "Năm học là bắt buộc")
        String schoolYear
) {}