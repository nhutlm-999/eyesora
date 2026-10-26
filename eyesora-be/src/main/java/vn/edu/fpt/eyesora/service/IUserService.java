package vn.edu.fpt.eyesora.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.edu.fpt.eyesora.dto.request.ChangePasswordRequest;
import vn.edu.fpt.eyesora.dto.request.UserCreateRequest;
import vn.edu.fpt.eyesora.dto.request.UserUpdateRequest;
import vn.edu.fpt.eyesora.dto.response.UserResponse;
import vn.edu.fpt.eyesora.entity.User;

public interface IUserService {
    Page<UserResponse> getAllUsers(Pageable pageable, String role);
    UserResponse getUserDetail(String id);
    void updateUserStatus(String userId, User.AccountStatus status);
    User findByUsername(String username);
    void changePassword(String userId, ChangePasswordRequest request);
    void createUserByAdmin(UserCreateRequest request);
    void updateUserByAdmin(String userId, UserUpdateRequest request);
}