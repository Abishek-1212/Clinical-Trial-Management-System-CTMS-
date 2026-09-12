package com.ctms.exception;

import com.ctms.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return build(HttpStatus.BAD_REQUEST, "Validation Failed", message, req.getRequestURI());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "Access Denied", ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "Unauthorized", "Invalid username or password", req.getRequestURI());
    }

    @ExceptionHandler(DatabaseLockViolationException.class)
    public ResponseEntity<ErrorResponse> handleDbLock(DatabaseLockViolationException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, "Database Locked", ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(UnauthorizedUnblindingException.class)
    public ResponseEntity<ErrorResponse> handleUnblinding(UnauthorizedUnblindingException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "Unblinding Unauthorized", ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(SAEReportingDeadlineException.class)
    public ResponseEntity<ErrorResponse> handleSAE(SAEReportingDeadlineException ex, HttpServletRequest req) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "SAE Deadline", ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(GCPComplianceException.class)
    public ResponseEntity<ErrorResponse> handleGCP(GCPComplianceException ex, HttpServletRequest req) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "GCP Compliance", ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegal(IllegalArgumentException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage(), req.getRequestURI());
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String error, String message, String path) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(LocalDateTime.now(), status.value(), error, message, path));
    }
}
