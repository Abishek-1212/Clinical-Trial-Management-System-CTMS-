package com.ctms.dto;

import com.ctms.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

public class AuthDTOs {

    @Data
    public static class RegisterRequest {
        @NotBlank
        @Size(min = 3, max = 50)
        private String username;

        @NotBlank
        @Email
        private String email;

        @NotBlank
        @Size(min = 8, max = 100)
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                 message = "Password must contain uppercase, lowercase, digit, and special character")
        private String password;

        @NotNull
        private Role role;

        private String institutionalAffiliation;

        @Pattern(regexp = "^[A-Za-z0-9-]*$", message = "GCP certificate number must contain valid letters, numbers or hyphens")
        private String gcpCertNumber;
        private String gcpExpiryDate;
    }

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;

        @NotBlank
        private String password;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private String username;
        private String email;
        private Role role;
        private Long userId;

        public LoginResponse(String token, String username, String email, Role role, Long userId) {
            this.token = token;
            this.username = username;
            this.email = email;
            this.role = role;
            this.userId = userId;
        }
    }
}
