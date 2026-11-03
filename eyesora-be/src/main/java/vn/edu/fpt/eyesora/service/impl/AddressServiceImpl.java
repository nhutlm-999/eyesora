package vn.edu.fpt.eyesora.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.eyesora.dto.request.ProvinceRequest;
import vn.edu.fpt.eyesora.dto.request.WardRequest;
import vn.edu.fpt.eyesora.dto.response.ProvinceResponse;
import vn.edu.fpt.eyesora.dto.response.WardResponse;
import vn.edu.fpt.eyesora.entity.Province;
import vn.edu.fpt.eyesora.entity.Ward;
import vn.edu.fpt.eyesora.exceptions.ResourceNotFoundException;
import vn.edu.fpt.eyesora.repository.ProvinceRepository;
import vn.edu.fpt.eyesora.repository.WardRepository;
import vn.edu.fpt.eyesora.service.IAddressService;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressServiceImpl implements IAddressService {

    private final ProvinceRepository provinceRepository;
    private final WardRepository wardRepository;

    @Override
    public ProvinceResponse createProvince(ProvinceRequest req) {
        Province province = new Province();
        province.setProvinceName(req.provinceName());

        province = provinceRepository.save(province);

        return new ProvinceResponse(
                province.getId(),
                province.getProvinceName()
        );
    }

    @Override
    public ProvinceResponse updateProvince(String id, ProvinceRequest req) {
        Province province = provinceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tỉnh/thành phố với ID: " + id
                ));

        province.setProvinceName(req.provinceName());

        province = provinceRepository.save(province);

        return new ProvinceResponse(
                province.getId(),
                province.getProvinceName()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProvinceResponse getProvinceById(String id) {
        return provinceRepository.findById(id)
                .map(province -> new ProvinceResponse(
                        province.getId(),
                        province.getProvinceName()
                ))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tỉnh/thành phố với ID: " + id
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProvinceResponse> getAllProvinces(Pageable pageable) {
        return provinceRepository.findAll(pageable)
                .map(province -> new ProvinceResponse(
                        province.getId(),
                        province.getProvinceName()
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WardResponse> getAllWards(String provinceId, Pageable pageable) {

        Page<Ward> wardPage = (provinceId != null && !provinceId.isBlank())
                ? wardRepository.findByProvinceId(provinceId, pageable)
                : wardRepository.findAll(pageable);

        return wardPage.map(ward -> new WardResponse(
                ward.getId(),
                ward.getWardName(),
                ward.getProvince() != null ? ward.getProvince().getId() : null,
                ward.getProvince() != null ? ward.getProvince().getProvinceName() : null
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public WardResponse getWardById(String id) {
        return wardRepository.findById(id)
                .map(ward -> new WardResponse(
                        ward.getId(),
                        ward.getWardName(),
                        ward.getProvince() != null ? ward.getProvince().getId() : null,
                        ward.getProvince() != null ? ward.getProvince().getProvinceName() : null
                ))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phường/xã với ID: " + id
                ));
    }

    @Override
    public WardResponse createWard(WardRequest req) {

        Province province = provinceRepository.findById(req.provinceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tỉnh/thành phố với ID: " + req.provinceId()
                ));

        Ward ward = new Ward();
        ward.setWardName(req.wardName());
        ward.setProvince(province);

        ward = wardRepository.save(ward);

        return new WardResponse(
                ward.getId(),
                ward.getWardName(),
                province.getId(),
                province.getProvinceName()
        );
    }

    @Override
    public WardResponse updateWard(String id, WardRequest req) {

        Ward ward = wardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phường/xã với ID: " + id
                ));

        ward.setWardName(req.wardName());

        if (req.provinceId() != null && !req.provinceId().isBlank()) {
            Province province = provinceRepository.findById(req.provinceId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy tỉnh/thành phố với ID: " + req.provinceId()
                    ));

            ward.setProvince(province);
        }

        ward = wardRepository.save(ward);

        return new WardResponse(
                ward.getId(),
                ward.getWardName(),
                ward.getProvince() != null ? ward.getProvince().getId() : null,
                ward.getProvince() != null ? ward.getProvince().getProvinceName() : null
        );
    }
}
