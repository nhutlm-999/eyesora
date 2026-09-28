package vn.edu.fpt.eyesora.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record EyeExamRecordUpdateRequest(

        // ===== KHÔNG KÍNH =====
        @NotNull(message = "Thị lực mắt trái chưa đeo kính không được để trống")
        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaLeftWithoutGlasses,

        @NotNull(message = "Thị lực mắt phải chưa đeo kính không được để trống")
        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaRightWithoutGlasses,

        // ===== CÓ KÍNH (CŨ) =====
        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaLeftOldGlasses,

        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaRightOldGlasses,

        // ===== KÍNH LỖ =====
        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaLeftPinhole,

        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaRightPinhole,

        // ===== ĐỘ CẦU (SPH) =====
        Float sphLeft,
        Float sphRight,

        // ===== ĐỘ TRỤ (CYL) =====
        Float cylLeft,
        Float cylRight,

        // ===== TRỤC (AXIS) =====
        @Min(value = 0, message = "Trục mắt trái phải lớn hơn hoặc bằng 0")
        @Max(value = 180, message = "Trục mắt trái phải nhỏ hơn hoặc bằng 180")
        Integer axisLeft,

        @Min(value = 0, message = "Trục mắt phải phải lớn hơn hoặc bằng 0")
        @Max(value = 180, message = "Trục mắt phải phải nhỏ hơn hoặc bằng 180")
        Integer axisRight,

        // ===== TLCK =====
        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaLeftWithGlasses,

        @Min(value = 0, message = "Thị lực không được nhỏ hơn 0")
        Float vaRightWithGlasses,

        // ===== KCĐT =====
        String pdLeft,
        String pdRight,
        
        java.time.LocalDate followupDate

) {
}