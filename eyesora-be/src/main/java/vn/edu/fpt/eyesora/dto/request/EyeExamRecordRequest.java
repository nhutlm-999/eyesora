package vn.edu.fpt.eyesora.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record EyeExamRecordRequest(

        @NotBlank(message = "Mã chiến dịch không được để trống")
        String campaignId,

        String patientId,

        String newPatientName,
        LocalDate newPatientDob,
        String newPatientGender,
        String newPatientParentPhone,
        String newPatientWardId,

        @NotBlank(message = "Mã lớp không được để trống")
        String classId,

        @NotBlank(message = "Mã người khám không được để trống")
        String examinerId,

        // ===== CÁC THÔNG SỐ KHÁM MẮT =====
        @NotNull(message = "Thị lực mắt trái chưa kính không được để trống")
        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaLeftWithoutGlasses,

        @NotNull(message = "Thị lực mắt phải chưa kính không được để trống")
        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaRightWithoutGlasses,

        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaLeftOldGlasses,

        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaRightOldGlasses,

        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaLeftPinhole,

        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaRightPinhole,

        Float sphLeft,
        Float sphRight,

        Float cylLeft,
        Float cylRight,

        @Min(value = 0, message = "Trục mắt trái phải >= 0")
        @Max(value = 180, message = "Trục mắt trái phải <= 180")
        Integer axisLeft,

        @Min(value = 0, message = "Trục mắt phải phải >= 0")
        @Max(value = 180, message = "Trục mắt phải phải <= 180")
        Integer axisRight,

        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaLeftWithGlasses,

        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaRightWithGlasses,

        String pdLeft,
        String pdRight,
        
        LocalDate followupDate
) {
}