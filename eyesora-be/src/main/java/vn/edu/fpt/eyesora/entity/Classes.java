package vn.edu.fpt.eyesora.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Formula;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "classes")
public class Classes {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "class_id", nullable = false, length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(name = "class_name", nullable = false, length = 50)
    private String className;

    @Column(name = "grade")
    private Integer grade;

    @Column(name = "school_year", length = 20)
    private String schoolYear;

    @OneToMany(mappedBy = "classes", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ClassEnrollment> enrollments = new ArrayList<>();

    @Formula("(SELECT COUNT(*) FROM class_enrollments ce JOIN patients p ON ce.patient_id = p.patient_id WHERE ce.class_id = class_id AND p.is_deleted = false AND ce.status = 'ACTIVE')")
    private Long patientCount;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    @PrePersist
    public void prePersist() {
        if (this.schoolYear == null || this.schoolYear.isBlank()) {
            this.schoolYear = calculateSchoolYear();
        }
    }

    public String calculateSchoolYear() {
        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();

        int startYear = (currentMonth >= 9) ? currentYear : currentYear - 1;
        int endYear = startYear + 1;

        return startYear + "-" + endYear;
    }
}