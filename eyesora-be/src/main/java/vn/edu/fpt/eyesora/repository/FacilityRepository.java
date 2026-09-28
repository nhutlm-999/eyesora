package vn.edu.fpt.eyesora.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.eyesora.entity.Facility;
import java.util.Optional;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, String> {
    @EntityGraph(attributePaths = {"ward", "ward.district"})
    Page<Facility> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"ward", "ward.district"})
    Optional<Facility> findWithDetailById(String id);

    Optional<Facility> findByFacilityName(String facilityName);

    long countByFacilityType(Facility.FacilityType facilityType);
}
