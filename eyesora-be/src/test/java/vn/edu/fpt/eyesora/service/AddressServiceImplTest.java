package vn.edu.fpt.eyesora.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import vn.edu.fpt.eyesora.dto.request.ProvinceRequest;
import vn.edu.fpt.eyesora.dto.request.WardRequest;
import vn.edu.fpt.eyesora.dto.response.ProvinceResponse;
import vn.edu.fpt.eyesora.dto.response.WardResponse;
import vn.edu.fpt.eyesora.entity.Province;
import vn.edu.fpt.eyesora.entity.Ward;
import vn.edu.fpt.eyesora.exceptions.ResourceNotFoundException;
import vn.edu.fpt.eyesora.repository.ProvinceRepository;
import vn.edu.fpt.eyesora.repository.WardRepository;
import vn.edu.fpt.eyesora.service.impl.AddressServiceImpl;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddressServiceImplTest {

    @Mock
    private ProvinceRepository provinceRepository;

    @Mock
    private WardRepository wardRepository;

    @InjectMocks
    private AddressServiceImpl addressService;

    private Province province;
    private Ward ward;

    @BeforeEach
    void setUp() {
        province = new Province();
        province.setId("p-1");
        province.setProvinceName("Thành phố Cần Thơ");

        ward = new Ward();
        ward.setId("w-1");
        ward.setWardName("Phú Lợi");
        ward.setProvince(province);
    }

    @Test
    void testCreateProvince_Success() {
        when(provinceRepository.save(any(Province.class))).thenAnswer(invocation -> {
            Province p = invocation.getArgument(0);
            p.setId("p-1");
            return p;
        });

        ProvinceResponse response = addressService.createProvince(new ProvinceRequest("Thành phố Cần Thơ"));

        assertNotNull(response);
        assertEquals("p-1", response.id());
        assertEquals("Thành phố Cần Thơ", response.provinceName());
        verify(provinceRepository, times(1)).save(any(Province.class));
    }

    @Test
    void testGetProvinceById_Success() {
        when(provinceRepository.findById("p-1")).thenReturn(Optional.of(province));

        ProvinceResponse response = addressService.getProvinceById("p-1");

        assertNotNull(response);
        assertEquals("p-1", response.id());
        assertEquals("Thành phố Cần Thơ", response.provinceName());
    }

    @Test
    void testGetProvinceById_NotFound() {
        when(provinceRepository.findById("p-99")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> addressService.getProvinceById("p-99"));
    }

    @Test
    void testCreateWard_Success() {
        when(provinceRepository.findById("p-1")).thenReturn(Optional.of(province));
        when(wardRepository.save(any(Ward.class))).thenAnswer(invocation -> {
            Ward w = invocation.getArgument(0);
            w.setId("w-1");
            return w;
        });

        WardResponse response = addressService.createWard(new WardRequest("Phú Lợi", "p-1"));

        assertNotNull(response);
        assertEquals("w-1", response.id());
        assertEquals("Phú Lợi", response.wardName());
        assertEquals("p-1", response.provinceId());
        assertEquals("Thành phố Cần Thơ", response.provinceName());
    }

    @Test
    void testGetAllWards_WithProvinceFilter() {
        PageRequest pageable = PageRequest.of(0, 10);
        when(wardRepository.findByProvinceId("p-1", pageable)).thenReturn(new PageImpl<>(List.of(ward)));

        Page<WardResponse> result = addressService.getAllWards("p-1", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Phú Lợi", result.getContent().get(0).wardName());
        assertEquals("Thành phố Cần Thơ", result.getContent().get(0).provinceName());
    }
}
