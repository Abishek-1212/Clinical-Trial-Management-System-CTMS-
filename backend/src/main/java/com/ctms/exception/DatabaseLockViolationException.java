package com.ctms.exception;

public class DatabaseLockViolationException extends RuntimeException {
    public DatabaseLockViolationException(String message) { super(message); }
}
