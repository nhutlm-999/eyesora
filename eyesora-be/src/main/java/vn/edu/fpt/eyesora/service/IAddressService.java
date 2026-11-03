package vn.edu.fpt.eyesora.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.edu.fpt.eyesora.dto.request.ProvinceRequest;
import vn.edu.fpt.eyesora.dto.request.WardRequest;
import vn.edu.fpt.eyesora.dto.response.ProvinceResponse;
import vn.edu.fpt.eyesora.dto.response.WardResponse;

public interface IAddressService {
    Page<ProvinceResponse> getAllProvinces(Pageable pageable);
    ProvinceResponse getProvinceById(String id);
    ProvinceResponse createProvince(ProvinceRequest req);
    ProvinceResponse updateProvince(String id, ProvinceRequest req);

    Page<WardResponse> getAllWards(String provinceId, Pageable pageable);
    WardResponse getWardById(String id);
    WardResponse createWard(WardRequest req);
    WardResponse updateWard(String id, WardRequest req);
}
