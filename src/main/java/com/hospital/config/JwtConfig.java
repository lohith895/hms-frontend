package com.hospital.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {

    @Value("${hospital.jwt.secret}")
    private String secret;

    @Value("${hospital.jwt.expiration}")
    private long expiration;

    @Value("${hospital.jwt.refreshExpiration}")
    private long refreshExpiration;

    public String getSecret() {
        return secret;
    }

    public long getExpiration() {
        return expiration;
    }

    public long getRefreshExpiration() {
        return refreshExpiration;
    }
}
