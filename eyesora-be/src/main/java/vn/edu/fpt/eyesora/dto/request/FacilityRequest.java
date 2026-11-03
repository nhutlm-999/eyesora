package vn.edu.fpt.eyesora.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import vn.edu.fpt.eyesora.entity.Facility;

public record FacilityRequest(
        @NotBlank(message = "Tên cơ sở là bắt buộc")
        @Size(max = 255, message = "Tên cơ sở không được vượt quá 255 ký tự")
        String facilityName,

        @NotNull(message = "Loại cơ sở là bắt buộc")
        Facility.FacilityType facilityType,

        @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
        String address,

        String phone,

        String provinceId,

        String wardId,

        @Size(max = 2048, message = "Liên kết Google Maps không được vượt quá 2048 ký tự")
        String googleMapsUrl,

        @Size(max = 150, message = "Tên hiệu trưởng không được vượt quá 150 ký tự")
        String principalName,

        @Size(max = 20, message = "Số điện thoại hiệu trưởng không được vượt quá 20 ký tự")
        String principalPhone
) {}
