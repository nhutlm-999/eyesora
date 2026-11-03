package vn.edu.fpt.eyesora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.eyesora.entity.Province;

import java.util.Optional;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, String> {
    Optional<Province> findByProvinceName(String provinceName);
    boolean existsByProvinceName(String provinceName);
}
