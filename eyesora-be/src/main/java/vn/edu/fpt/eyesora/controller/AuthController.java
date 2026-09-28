package vn.edu.fpt.eyesora.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.eyesora.dto.request.ForgotPasswordRequest;
import vn.edu.fpt.eyesora.dto.request.LoginRequest;
import vn.edu.fpt.eyesora.dto.request.RegisterRequest;
import vn.edu.fpt.eyesora.dto.request.ResetPasswordRequest;
import vn.edu.fpt.eyesora.entity.RefreshToken;
import vn.edu.fpt.eyesora.entity.User;
import vn.edu.fpt.eyesora.exceptions.BadRequestException;
import vn.edu.fpt.eyesora.exceptions.ResourceNotFoundException;
import vn.edu.fpt.eyesora.service.IAuthService;
import vn.edu.fpt.eyesora.service.IRefreshTokenService;
import vn.edu.fpt.eyesora.service.impl.UserDetailsService;
import vn.edu.fpt.eyesora.util.JwtUtil;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;
    private final AuthenticationManager authManager;
    private final IRefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    private void setCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        Cookie accessCookie = new Cookie("accessToken", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false); // Should be true in prod with HTTPS
        accessCookie.setPath("/");
        accessCookie.setMaxAge(1000 * 60 * 60 * 24); // 24 hours
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false); // Should be true in prod
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(1000 * 60 * 60 * 24 * 7); // 7 days
        response.addCookie(refreshCookie);
    }

    private void clearCookies(HttpServletResponse response) {
        Cookie accessCookie = new Cookie("accessToken", null);
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);
    }

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password())
        );

        User user = (User) authentication.getPrincipal();
        String accessToken = jwtUtil.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUsername(), "user");

        setCookies(response, accessToken, refreshToken.getToken());

        return ResponseEntity.ok(Map.of("message", "Login successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh Access Token")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String reqRefreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("refreshToken".equals(c.getName())) {
                    reqRefreshToken = c.getValue();
                }
            }
        }
        
        if (reqRefreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No refresh token");
        }

        try {
            RefreshToken rt = refreshTokenService.verifyRefreshToken(reqRefreshToken);
            UserDetails user = userDetailsService.loadUserByUsername(rt.getUsername());
            
            String newAccess = jwtUtil.generateToken(user);
            RefreshToken newRt = refreshTokenService.rotate(rt);
            
            setCookies(response, newAccess, newRt.getToken());
            return ResponseEntity.ok(Map.of("message", "Tokens refreshed"));
        } catch (Exception e) {
            clearCookies(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) auth.getPrincipal();
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("name", user.getFull_name());
        data.put("roles", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));
        if (user.getFacility() != null) {
            data.put("facilityId", user.getFacility().getId());
        }
        
        return ResponseEntity.ok(data);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String reqRefreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("refreshToken".equals(c.getName())) {
                    reqRefreshToken = c.getValue();
                }
            }
        }
        if (reqRefreshToken != null) {
            try {
                refreshTokenService.deleteByToken(reqRefreshToken);
            } catch (Exception ignored) {}
        }
        clearCookies(response);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Đăng ký thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        try {
            authService.verifyEmail(token);
            return ResponseEntity.ok("Xác thực tài khoản thành công.");
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestParam("email") String email) {
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok("Đã gửi lại email xác thực.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            authService.processForgotPassword(request.email());
            return ResponseEntity.ok("Đã gửi liên kết đặt lại mật khẩu.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok("Đặt lại mật khẩu thành công.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
