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

//        @Pattern(
//                regexp = "^[0-9]{10,11}$",
//                message = "Số điện thoại phải có từ 10 đến 11 chữ số"
//        )
        String phone,

//        @NotBlank(message = "Mã quận/huyện là bắt buộc")
        String districtId,

//        @NotBlank(message = "Mã phường/xã là bắt buộc")
        String wardId,

        @Size(max = 2048, message = "Liên kết Google Maps không được vượt quá 2048 ký tự")
        String googleMapsUrl
) {}
