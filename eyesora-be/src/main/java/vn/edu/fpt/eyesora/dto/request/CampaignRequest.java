package vn.edu.fpt.eyesora.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CampaignRequest (
        @NotBlank(message = "Tiêu đề là bắt buộc")
        String title,

//        @NotBlank(message = "Năm là bắt buộc")
        String year,

//        @NotNull(message = "Ngày bắt đầu là bắt buộc")
        LocalDate startDate,

//        @NotNull(message = "Ngày kết thúc là bắt buộc")
        LocalDate endDate,

//        @NotBlank(message = "Người quản lý là bắt buộc")
        String managerName,

//        @NotBlank(message = "Tổ chức là bắt buộc")
        String orgId,

//        @NotBlank(message = "Trường mục tiêu là bắt buộc")
        String targetId
){}