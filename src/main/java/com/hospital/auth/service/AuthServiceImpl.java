package com.hospital.auth.service;

import com.hospital.auth.dto.AuthResponse;
import com.hospital.auth.dto.LoginRequest;
import com.hospital.auth.dto.RegisterRequest;
import com.hospital.auth.dto.TokenRefreshRequest;
import com.hospital.auth.dto.TokenRefreshResponse;
import com.hospital.users.entity.User;
import com.hospital.users.repository.UserRepository;
import com.hospital.security.JwtService;
import com.hospital.security.RefreshTokenService;
import com.hospital.users.service.AuditLogService;
import com.hospital.common.enums.Role;
import com.hospital.doctors.repository.DoctorRepository;
import com.hospital.doctors.entity.Doctor;
import com.hospital.patients.repository.PatientRepository;
import com.hospital.patients.entity.Patient;
import com.hospital.departments.repository.DepartmentRepository;
import com.hospital.nurses.repository.NurseRepository;
import com.hospital.nurses.entity.Nurse;
import com.hospital.pharmacy.repository.PharmacistRepository;
import com.hospital.pharmacy.entity.Pharmacist;
import com.hospital.laboratory.repository.LabTechnicianRepository;
import com.hospital.laboratory.entity.LabTechnician;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuditLogService auditLogService;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DepartmentRepository departmentRepository;
    private final NurseRepository nurseRepository;
    private final PharmacistRepository pharmacistRepository;
    private final LabTechnicianRepository labTechnicianRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager, UserRepository userRepository,
                           PasswordEncoder passwordEncoder, JwtService jwtService,
                           RefreshTokenService refreshTokenService, AuditLogService auditLogService,
                           DoctorRepository doctorRepository, PatientRepository patientRepository,
                           DepartmentRepository departmentRepository, NurseRepository nurseRepository,
                           PharmacistRepository pharmacistRepository, LabTechnicianRepository labTechnicianRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.auditLogService = auditLogService;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.departmentRepository = departmentRepository;
        this.nurseRepository = nurseRepository;
        this.pharmacistRepository = pharmacistRepository;
        this.labTechnicianRepository = labTechnicianRepository;
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest, String ipAddress) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByUsernameOrEmail(
                    loginRequest.getUsernameOrEmail(),
                    loginRequest.getUsernameOrEmail()
            ).orElseThrow(() -> new RuntimeException("Authenticated user details not found in database."));

            String jwt = jwtService.generateToken(authentication);
            var refreshToken = refreshTokenService.createRefreshToken(user.getUsername());

            auditLogService.log(user.getUsername(), "LOGIN_SUCCESS", "Successful authentication", ipAddress);

            return new AuthResponse(
                    jwt,
                    refreshToken.getToken(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole(),
                    user.getFirstName(),
                    user.getLastName()
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            auditLogService.log(loginRequest.getUsernameOrEmail(), "LOGIN_FAILURE", "Authentication failed: " + ex.getMessage(), ipAddress);
            throw ex;
        }
    }

    @Override
    @Transactional
    public Map<String, Object> register(RegisterRequest registerRequest, String ipAddress) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email address is already in use!");
        }

        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getRole(),
                registerRequest.getFirstName(),
                registerRequest.getLastName()
        );

        User result = userRepository.save(user);

        if (result.getRole() == Role.ROLE_DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(result);
            doctor.setSpecialization(registerRequest.getSpecialization() != null ? registerRequest.getSpecialization() : "General");
            doctor.setExperienceYears(registerRequest.getExperienceYears());
            doctor.setConsultationFee(registerRequest.getConsultationFee());
            doctor.setPhone(registerRequest.getPhone());
            doctor.setLicenseNumber("N/A-" + java.util.UUID.randomUUID().toString().substring(0, 8));
            
            if (registerRequest.getDepartmentId() != null) {
                departmentRepository.findById(registerRequest.getDepartmentId()).ifPresent(doctor::setDepartment);
            }
            
            doctorRepository.save(doctor);
        } else if (result.getRole() == Role.ROLE_PATIENT) {
            Patient patient = new Patient();
            patient.setUser(result);
            patient.setDateOfBirth(registerRequest.getDateOfBirth());
            patient.setGender(registerRequest.getGender());
            patient.setBloodGroup(registerRequest.getBloodGroup());
            patient.setAddress(registerRequest.getAddress());
            patient.setEmergencyContact(registerRequest.getEmergencyContact());
            patientRepository.save(patient);
        } else if (result.getRole() == Role.ROLE_NURSE) {
            Nurse nurse = new Nurse();
            nurse.setUser(result);
            nurse.setShift(registerRequest.getShift());
            nurse.setPhone(registerRequest.getPhone());
            if (registerRequest.getDepartmentId() != null) {
                departmentRepository.findById(registerRequest.getDepartmentId()).ifPresent(nurse::setDepartment);
            }
            nurseRepository.save(nurse);
        } else if (result.getRole() == Role.ROLE_PHARMACIST) {
            Pharmacist pharmacist = new Pharmacist();
            pharmacist.setUser(result);
            pharmacist.setLicenseNumber(registerRequest.getLicenseNumber() != null ? registerRequest.getLicenseNumber() : "N/A-" + java.util.UUID.randomUUID().toString().substring(0, 8));
            pharmacist.setQualification(registerRequest.getQualification());
            pharmacist.setPhone(registerRequest.getPhone());
            pharmacistRepository.save(pharmacist);
        } else if (result.getRole() == Role.ROLE_LAB_TECHNICIAN) {
            LabTechnician lab = new LabTechnician();
            lab.setUser(result);
            lab.setSpecialization(registerRequest.getSpecialization());
            lab.setCertification(registerRequest.getCertification());
            lab.setPhone(registerRequest.getPhone());
            labTechnicianRepository.save(lab);
        }

        auditLogService.log(result.getUsername(), "USER_REGISTRATION", "Successfully registered with role: " + result.getRole(), ipAddress);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", result.getId());
        response.put("username", result.getUsername());
        response.put("role", result.getRole());

        return response;
    }

    @Override
    public Map<String, Object> getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user details not found in database."));

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        userMap.put("firstName", user.getFirstName());
        userMap.put("lastName", user.getLastName());
        userMap.put("isActive", user.isActive());

        return userMap;
    }

    @Override
    @Transactional
    public Map<String, Object> updateProfile(UserDetails userDetails, Map<String, String> updates) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("firstName") && updates.get("firstName") != null && !updates.get("firstName").isBlank()) {
            user.setFirstName(updates.get("firstName").trim());
        }
        if (updates.containsKey("lastName") && updates.get("lastName") != null && !updates.get("lastName").isBlank()) {
            user.setLastName(updates.get("lastName").trim());
        }
        if (updates.containsKey("email") && updates.get("email") != null && !updates.get("email").isBlank()) {
            String newEmail = updates.get("email").trim();
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new RuntimeException("Email address is already in use by another account.");
            }
            user.setEmail(newEmail);
        }

        User saved = userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("username", saved.getUsername());
        result.put("email", saved.getEmail());
        result.put("role", saved.getRole());
        result.put("firstName", saved.getFirstName());
        result.put("lastName", saved.getLastName());
        result.put("isActive", saved.isActive());
        return result;
    }

    @Override
    @Transactional
    public Map<String, String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found with email: " + email));
                
        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        System.out.println("==========================================================");
        System.out.println("PASSWORD RESET LINK FOR " + email);
        System.out.println("http://localhost:3000/reset-password/" + token);
        System.out.println("==========================================================");
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "If an account exists, a password reset link has been sent.");
        response.put("devResetLink", "http://localhost:3000/reset-password/" + token); // Mock email
        return response;
    }

    @Override
    @Transactional
    public Map<String, String> resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token."));
                
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired.");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been successfully reset. You can now log in.");
        return response;
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest refreshRequest, String ipAddress) {
        String token = refreshRequest.getRefreshToken();
        return refreshTokenService.findByToken(token)
                .map(refreshTokenService::verifyExpiration)
                .map(dbToken -> {
                    User user = dbToken.getUser();
                    String accessToken = jwtService.generateToken(user.getUsername());
                    var newRefreshToken = refreshTokenService.createRefreshToken(user.getUsername());
                    
                    auditLogService.log(user.getUsername(), "TOKEN_REFRESH_SUCCESS", "Successfully refreshed access token", ipAddress);
                    return new TokenRefreshResponse(accessToken, newRefreshToken.getToken());
                })
                .orElseThrow(() -> {
                    auditLogService.log("anonymous", "TOKEN_REFRESH_FAILURE", "Attempted token refresh with invalid token: " + token, ipAddress);
                    return new RuntimeException("Refresh token is not in database!");
                });
    }

    @Override
    @Transactional
    public void logout(String username, String ipAddress) {
        if (username != null && !username.equalsIgnoreCase("anonymous")) {
            refreshTokenService.deleteByUser(username);
            auditLogService.log(username, "LOGOUT", "User logged out successfully", ipAddress);
        }
    }
}
