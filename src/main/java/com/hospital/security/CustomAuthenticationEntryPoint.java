package com.hospital.security;

import com.hospital.users.service.AuditLogService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final AuditLogService auditLogService;

    public CustomAuthenticationEntryPoint(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        String ipAddress = request.getRemoteAddr();
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Log unauthorized attempt into AuditLog
        auditLogService.log(
                "anonymous",
                "UNAUTHORIZED_ACCESS_ATTEMPT",
                String.format("Blocked %s request to %s. Error: %s", method, path, authException.getMessage()),
                ipAddress
        );

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getOutputStream().println(
                String.format("{ \"error\": \"Unauthorized\", \"message\": \"%s\" }", authException.getMessage())
        );
    }
}
