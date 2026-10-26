package vn.edu.fpt.eyesora.repository;

import aj.org.objectweb.asm.commons.Remapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.eyesora.dto.response.UserResponse;
import vn.edu.fpt.eyesora.entity.Role;
import vn.edu.fpt.eyesora.entity.User;

import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    Page<User> findByRoleName(@Param("roleName") String roleName, Pageable pageable);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.facility WHERE u.username = :username")
    Optional<User> findByUsername(@Param("username") String username);

    @Query(value = "SELECT u FROM User u LEFT JOIN FETCH u.facility",
            countQuery = "SELECT COUNT(u) FROM User u")
    Page<User> findAll(Pageable pageable);

}
