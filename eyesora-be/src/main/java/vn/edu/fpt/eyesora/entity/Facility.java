package vn.edu.fpt.eyesora.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "facilities")
public class Facility {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "facility_id", nullable = false, length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "ward_id", nullable = true)
    private Ward ward;

    @Column(name = "facility_name", nullable = false)
    private String facilityName;

    @Enumerated(EnumType.STRING)
    @Column(name = "facility_type", nullable = true, length = 10)
    private FacilityType facilityType;

    @Column(name = "address")
    private String address;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "google_maps_url", length = 2048)
    private String googleMapsUrl;

    public enum FacilityType {
        SCHOOL, CLINIC, HOSPITAL
    }
}
