package com.hospital.auth.service;

import com.hospital.auth.dto.AuthResponse;
import com.hospital.auth.dto.LoginRequest;
import com.hospital.auth.dto.RegisterRequest;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;

import com.hospital.auth.dto.TokenRefreshRequest;
import com.hospital.auth.dto.TokenRefreshResponse;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest, String ipAddress);
    Map<String, Object> register(RegisterRequest registerRequest, String ipAddress);
    Map<String, Object> getCurrentUser(UserDetails userDetails);
    Map<String, Object> updateProfile(UserDetails userDetails, Map<String, String> updates);
    TokenRefreshResponse refreshToken(TokenRefreshRequest refreshRequest, String ipAddress);
    void logout(String username, String ipAddress);
    Map<String, String> forgotPassword(String email);
    Map<String, String> resetPassword(String token, String newPassword);
}

