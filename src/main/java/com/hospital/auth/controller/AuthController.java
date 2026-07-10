package com.hospital.auth.controller;

import com.hospital.auth.dto.AuthResponse;
import com.hospital.auth.dto.LoginRequest;
import com.hospital.auth.dto.RegisterRequest;
import com.hospital.auth.dto.TokenRefreshRequest;
import com.hospital.auth.dto.TokenRefreshResponse;
import com.hospital.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            String ipAddress = request.getRemoteAddr();
            AuthResponse response = authService.login(loginRequest, ipAddress);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, String> errors = new HashMap<>();
            errors.put("error", "Unauthorized");
            errors.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errors);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        try {
            String ipAddress = request.getRemoteAddr();
            Map<String, Object> response = authService.register(registerRequest, ipAddress);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Bad Request");
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@Valid @RequestBody TokenRefreshRequest refreshRequest, HttpServletRequest request) {
        try {
            String ipAddress = request.getRemoteAddr();
            TokenRefreshResponse response = authService.refreshToken(refreshRequest, ipAddress);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, String> errors = new HashMap<>();
            errors.put("error", "Unauthorized");
            errors.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errors);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@AuthenticationPrincipal UserDetails userDetails, HttpServletRequest request) {
        try {
            String ipAddress = request.getRemoteAddr();
            String username = userDetails != null ? userDetails.getUsername() : "anonymous";
            authService.logout(username, ipAddress);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Log out successful");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Internal Server Error");
            response.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Map<String, Object> response = authService.getCurrentUser(userDetails);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> updates) {
        try {
            Map<String, Object> response = authService.updateProfile(userDetails, updates);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, String> errors = new HashMap<>();
            errors.put("error", "Bad Request");
            errors.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(errors);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody com.hospital.auth.dto.ForgotPasswordRequest request) {
        try {
            Map<String, String> response = authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, String> errors = new HashMap<>();
            errors.put("error", "Bad Request");
            errors.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(errors);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody com.hospital.auth.dto.ResetPasswordRequest request) {
        try {
            Map<String, String> response = authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, String> errors = new HashMap<>();
            errors.put("error", "Bad Request");
            errors.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(errors);
        }
    }
}
