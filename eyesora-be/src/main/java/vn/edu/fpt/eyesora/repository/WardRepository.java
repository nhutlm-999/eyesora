package vn.edu.fpt.eyesora.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.eyesora.entity.Ward;

import java.util.Optional;

@Repository
public interface WardRepository extends JpaRepository<Ward, String> {

    @EntityGraph(attributePaths = {"province"})
    Page<Ward> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"province"})
    Page<Ward> findByProvinceId(String provinceId, Pageable pageable);

    Optional<Ward> findByWardNameAndProvinceId(String wardName, String provinceId);

    boolean existsByWardNameAndProvinceId(String wardName, String provinceId);
}
