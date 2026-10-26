package vn.edu.fpt.eyesora.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record PatientRequest(
        @NotBlank(message = "Tên bệnh nhân là bắt buộc")
        @Size(max = 255, message = "Tên bệnh nhân không được vượt quá 255 ký tự")
        String patientName,

        @NotBlank(message = "Mã lớp là bắt buộc")
        String classId,

        @Past(message = "Ngày sinh phải là ngày trong quá khứ")
        LocalDate dob,

        @NotBlank(message = "Giới tính là bắt buộc")
        String gender,

        @Pattern(
                regexp = "^0\\d{9,10}$",
                message = "Số điện thoại phải bắt đầu bằng 0 và có 10–11 chữ số"
        )
        String parentPhone,

        @NotBlank(message = "Mã chiến dịch là bắt buộc")
        String campaignId,

        @NotBlank(message = "Mã cơ sở là bắt buộc")
        String facilityId,

        String wardId
) {}