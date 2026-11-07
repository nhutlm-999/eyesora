package vn.edu.fpt.eyesora.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import vn.edu.fpt.eyesora.dto.request.ChangePasswordRequest;
import vn.edu.fpt.eyesora.dto.request.UserCreateRequest;
import vn.edu.fpt.eyesora.dto.request.UserStatusRequest;
import vn.edu.fpt.eyesora.dto.request.UserUpdateRequest;
import vn.edu.fpt.eyesora.dto.response.UserResponse;
import vn.edu.fpt.eyesora.entity.User;
import vn.edu.fpt.eyesora.exceptions.BadRequestException;
import vn.edu.fpt.eyesora.service.IUserService;

import java.security.Principal;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "username") String sortBy,
            @RequestParam(required = false) String role
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(userService.getAllUsers(pageable, role));
    }

    /** Thông tin tài khoản đang đăng nhập - mọi role đều xem được profile của chính mình. */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        return ResponseEntity.ok(userService.getUserDetail(user.getId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody UserStatusRequest req) {
        userService.updateUserStatus(id, req.status());
        return ResponseEntity.ok("Đã cập nhật trạng thái tài khoản thành " + req.status());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserDetail(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserDetail(id));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Principal principal) {
        try {
            String username = principal.getName();
            User user = userService.findByUsername(username);

            userService.changePassword(user.getId(), request);
            return ResponseEntity.ok("Thay đổi mật khẩu thành công.");
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<String> createUser(@Valid @RequestBody UserCreateRequest request) {
        userService.createUserByAdmin(request);
        return ResponseEntity.ok("Tạo tài khoản " + request.roleNames() + " thành công!");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserUpdateRequest request) {
        userService.updateUserByAdmin(id, request);
        return ResponseEntity.ok("Cập nhật thông tin thành công!");
    }
}
