package vn.edu.fpt.eyesora.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.eyesora.entity.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Query(value = "SELECT u FROM User u LEFT JOIN FETCH u.facility JOIN u.roles r " +
            "WHERE LOWER(r.name) = LOWER(:roleName) " +
            "   OR LOWER(r.name) = LOWER(CONCAT('ROLE_', :roleName)) " +
            "   OR LOWER(CONCAT('ROLE_', r.name)) = LOWER(:roleName)",
            countQuery = "SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r " +
                    "WHERE LOWER(r.name) = LOWER(:roleName) " +
                    "   OR LOWER(r.name) = LOWER(CONCAT('ROLE_', :roleName)) " +
                    "   OR LOWER(CONCAT('ROLE_', r.name)) = LOWER(:roleName)")
    Page<User> findByRoleName(@Param("roleName") String roleName, Pageable pageable);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.facility WHERE u.username = :username")
    Optional<User> findByUsername(@Param("username") String username);

    @Query(value = "SELECT u FROM User u LEFT JOIN FETCH u.facility",
            countQuery = "SELECT COUNT(u) FROM User u")
    Page<User> findAll(Pageable pageable);

}
