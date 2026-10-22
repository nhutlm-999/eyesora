package vn.edu.fpt.eyesora.dto.response;

import vn.edu.fpt.eyesora.entity.Facility;

public record FacilityResponse(
        String id,
        String facilityName,
        Facility.FacilityType facilityType,
        String address,
        String phone,
        String wardName,
        String wardId,
        String districtId,
        String googleMapsUrl,
        String principalName,
        String principalPhone
) {}
