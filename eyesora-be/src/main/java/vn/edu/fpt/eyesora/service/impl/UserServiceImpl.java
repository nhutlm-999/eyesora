package vn.edu.fpt.eyesora.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.eyesora.dto.request.ChangePasswordRequest;
import vn.edu.fpt.eyesora.dto.request.UserCreateRequest;
import vn.edu.fpt.eyesora.dto.request.UserUpdateRequest;
import vn.edu.fpt.eyesora.dto.response.UserResponse;
import vn.edu.fpt.eyesora.entity.Facility;
import vn.edu.fpt.eyesora.entity.Role;
import vn.edu.fpt.eyesora.entity.User;
import vn.edu.fpt.eyesora.exceptions.BadRequestException;
import vn.edu.fpt.eyesora.exceptions.ResourceNotFoundException;
import vn.edu.fpt.eyesora.repository.FacilityRepository;
import vn.edu.fpt.eyesora.repository.RoleRepository;
import vn.edu.fpt.eyesora.repository.UserRepository;
import vn.edu.fpt.eyesora.service.IUserService;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable, String role) {
        if (role != null && !role.trim().isEmpty()) {
            return userRepository.findByRoleName(role, pageable).map(this::mapToUserResponse);
        }
        return userRepository.findAll(pageable).map(this::mapToUserResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserDetail(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));
        return mapToUserResponse(user);
    }

    @Override
    public void updateUserStatus(String userId, User.AccountStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    @Override
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu mới và xác nhận mật khẩu không khớp.");
        }

        if (!isValidPassword(request.getNewPassword())) {
            throw new BadRequestException("Mật khẩu phải từ 8-50 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword_hash())) {
            throw new BadRequestException("Mật khẩu cũ không chính xác.");
        }

        user.setPassword_hash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Người dùng {} đã thay đổi mật khẩu thành công.", user.getEmail());
    }

    @Override
    @Transactional
    public void createUserByAdmin(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username đã tồn tại!");
        }

        Set<Role> roles = request.roleNames().stream()
                .map(name -> roleRepository.findByName(name)
                        .orElseThrow(() -> new ResourceNotFoundException("Quyền không tồn tại: " + name)))
                .collect(Collectors.toSet());

        boolean hasAdminOrExaminer = roles.stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase("ADMIN") || r.getName().equalsIgnoreCase("EXAMINER"));
        boolean isFacilityAdmin = roles.stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase("FACILITY_ADMIN"));

        boolean needsFacility = isFacilityAdmin && !hasAdminOrExaminer;

        User user = new User();
        user.setUsername(request.username());
        user.setPassword_hash(passwordEncoder.encode(request.password()));
        user.setEmail(request.email());
        user.setFull_name(request.fullName());
        user.setRoles(roles);
        user.setStatus(User.AccountStatus.ACTIVE);
        System.out.println(user.getId());

        if (needsFacility) {
            if (request.facilityId() == null || request.facilityId().isBlank()) {
                throw new BadRequestException("Tài khoản này có vai trò yêu cầu cơ sở quản lý, vui lòng chọn cơ sở!");
            }
            Facility facility = facilityRepository.findById(request.facilityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở: " + request.facilityId()));
            user.setFacility(facility);
        } else {
            user.setFacility(null);
        }

        userRepository.save(user);

        String facilityInfo = (user.getFacility() != null) ? user.getFacility().getFacilityName() : "Toàn hệ thống";
        log.info("Super Admin đã tạo tài khoản cho: {} với quyền {}, tại cơ sở: {}",
                request.username(), request.roleNames(), facilityInfo);
    }

    @Override
    @Transactional
    public void updateUserByAdmin(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        user.setFull_name(request.fullName());
        user.setEmail(request.email());

        if (request.roleNames() != null && !request.roleNames().isEmpty()) {
            Set<Role> roles = request.roleNames().stream()
                    .map(name -> roleRepository.findByName(name)
                            .orElseThrow(() -> new ResourceNotFoundException("Quyền không tồn tại: " + name)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        boolean hasAdminOrExaminer = user.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase("ADMIN") || r.getName().equalsIgnoreCase("EXAMINER"));
        boolean isFacilityAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase("FACILITY_ADMIN"));

        boolean needsFacility = isFacilityAdmin && !hasAdminOrExaminer;

        if (needsFacility) {
            if ((request.facilityId() == null || request.facilityId().isBlank()) && user.getFacility() == null) {
                throw new BadRequestException("Tài khoản này cần cơ sở quản lý, vui lòng chọn cơ sở!");
            }
            if (request.facilityId() != null && !request.facilityId().isBlank()) {
                Facility facility = facilityRepository.findById(request.facilityId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở"));
                user.setFacility(facility);
            }
        } else {
            user.setFacility(null);
        }

        userRepository.save(user);
        log.info("Super Admin đã cập nhật thông tin người dùng: {}", user.getUsername());
    }

    private boolean isValidPassword(String password) {
        String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,50}$";
        return password != null && password.matches(regex);
    }

    private UserResponse mapToUserResponse(User user) {
        String facilityName = (user.getFacility() != null)
                ? user.getFacility().getFacilityName()
                : "N/A";
        String facilityId = (user.getFacility() != null)
                ? user.getFacility().getId()
                : null;
        Set<String> roleNames = (user.getRoles() != null)
                ? user.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
                : Set.of();

        String statusName = (user.getStatus() != null)
                ? user.getStatus().name()
                : "UNKNOWN";

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFull_name(),
                statusName,
                roleNames,
                facilityName,
                facilityId
        );
    }
}