package vn.edu.fpt.eyesora.service;

import vn.edu.fpt.eyesora.dto.request.RegisterRequest;
import vn.edu.fpt.eyesora.dto.request.ResetPasswordRequest;

public interface IAuthService {
    void register(RegisterRequest request);
    void verifyEmail(String token);
    void resendVerificationEmail(String email);
    void processForgotPassword(String email);
    void resetPassword(ResetPasswordRequest request);
}
