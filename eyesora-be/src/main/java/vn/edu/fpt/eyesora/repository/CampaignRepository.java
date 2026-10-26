package vn.edu.fpt.eyesora.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.edu.fpt.eyesora.entity.ExamCampaign;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface CampaignRepository extends JpaRepository<ExamCampaign, String> {

    @EntityGraph(attributePaths = {"organization", "targetfacility"})
    Page<ExamCampaign> findByStatusNot(ExamCampaign.CampaignStatus status, Pageable pageable);

    Page<ExamCampaign> findByStatus(ExamCampaign.CampaignStatus status, Pageable pageable);


    @EntityGraph(attributePaths = {"organization", "targetfacility"})
    Optional<ExamCampaign> findWithDetailByCampaignId(String campaignId);

    @Query("""
        SELECT COUNT(DISTINCT er.patient.patientId) 
        FROM EyeExamRecord er 
        WHERE er.campaign.campaignId = :campaignId
    """)
    Long countPatientsByCampaignId(@Param("campaignId") String campaignId);

    boolean existsByTargetfacility_IdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            String facilityId, LocalDate endDate, LocalDate startDate);

    boolean existsByTargetfacility_IdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndCampaignIdNot(
            String facilityId, LocalDate endDate, LocalDate startDate, String campaignId);
}
