package vn.edu.fpt.eyesora.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.eyesora.dto.request.RegisterRequest;
import vn.edu.fpt.eyesora.dto.request.ResetPasswordRequest;
import vn.edu.fpt.eyesora.entity.*;
import vn.edu.fpt.eyesora.exceptions.BadRequestException;
import vn.edu.fpt.eyesora.exceptions.ResourceNotFoundException;
import vn.edu.fpt.eyesora.repository.*;
import vn.edu.fpt.eyesora.service.IAuthService;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JavaMailSender mailSender;
    private final FacilityRepository facilityRepository;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Tên đăng nhập đã tồn tại");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email đã được sử dụng");
        }
        if (!request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Mật khẩu không khớp");
        }
        if (!isValidPassword(request.password())) {
            throw new BadRequestException("Mật khẩu phải từ 8-50 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
        }

        Facility facility = facilityRepository.findById(request.facilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở với ID: " + request.facilityId()));

        Role defaultRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new ResourceNotFoundException("Cấu hình ROLE_USER bị thiếu"));

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword_hash(passwordEncoder.encode(request.password()));
        user.setFull_name(request.fullName());
        user.setFacility(facility);
        user.setStatus(User.AccountStatus.UNVERIFIED);
        user.setRoles(Set.of(defaultRole));

        userRepository.save(user);

        String tokenString = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(tokenString);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(verificationToken);

        sendVerificationEmail(user.getEmail(), tokenString);
        log.info("Đã đăng ký người dùng, email xác thực đã được gửi: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Mã xác thực không hợp lệ"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã xác thực đã hết hạn");
        }

        User user = verificationToken.getUser();
        user.setStatus(User.AccountStatus.ACTIVE);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);
        log.info("Tài khoản đã được kích hoạt thành công: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (user.getStatus() == User.AccountStatus.ACTIVE) {
            throw new BadRequestException("Tài khoản đã được xác thực.");
        }

        tokenRepository.deleteByUser(user);

        String newToken = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(newToken);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(verificationToken);

        sendVerificationEmail(user.getEmail(), newToken);
    }

    @Override
    @Transactional
    public void processForgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email này"));

        passwordResetTokenRepository.deleteByUser(user);

        String tokenString = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenString);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        passwordResetTokenRepository.save(resetToken);

        sendPasswordResetEmail(user.getEmail(), tokenString);
        log.info("Email đặt lại mật khẩu đã được gửi đến: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Mật khẩu không khớp");
        }
        if (!isValidPassword(request.newPassword())) {
            throw new BadRequestException("Mật khẩu phải từ 8-50 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new BadRequestException("Mã đặt lại mật khẩu không hợp lệ"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Mã đặt lại mật khẩu đã hết hạn");
        }

        User user = resetToken.getUser();
        user.setPassword_hash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
        log.info("Mật khẩu đã được đặt lại thành công cho người dùng: {}", user.getEmail());
    }

    private boolean isValidPassword(String password) {
        String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,50}$";
        return password != null && password.matches(regex);
    }

    private void sendVerificationEmail(String email, String token) {
        try {
            String link = "http://localhost:8080/api/auth/verify?token=" + token;
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject("[Eyesora] Xác thực tài khoản");
            msg.setText("Xin chào,\n\nNhấp vào liên kết bên dưới để xác thực email của bạn (có hiệu lực trong 15 phút):\n" + link);
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Gửi email xác thực thất bại đến {}. Lỗi: {}", email, e.getMessage());
        }
    }

    private void sendPasswordResetEmail(String email, String token) {
        try {
            String link = "http://localhost:8080/api/auth/reset-password?token=" + token;
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject("[Eyesora] Yêu cầu đặt lại mật khẩu");
            msg.setText("Xin chào,\n\nNhấp vào liên kết bên dưới để tạo mật khẩu mới (có hiệu lực trong 15 phút):\n" + link);
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Gửi email đặt lại mật khẩu thất bại đến {}. Lỗi: {}", email, e.getMessage());
        }
    }
}