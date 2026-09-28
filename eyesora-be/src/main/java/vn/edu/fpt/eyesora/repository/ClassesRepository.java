package vn.edu.fpt.eyesora.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.eyesora.entity.Classes;
import vn.edu.fpt.eyesora.entity.Facility;

import java.util.Optional;

@Repository
public interface ClassesRepository extends JpaRepository<Classes,String>, JpaSpecificationExecutor<Classes> {

    @EntityGraph(attributePaths = {"patients", "patients.ward"})
    Optional<Classes> findWithPatientsById(String id);

    Optional<Classes> findByClassNameAndFacility(String className, Facility facility);

    
}
