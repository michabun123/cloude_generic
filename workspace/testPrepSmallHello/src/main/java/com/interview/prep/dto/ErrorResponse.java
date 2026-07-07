package com.interview.prep.dto;

import java.time.Instant;
import java.util.Map;

/**
 * Standard error envelope returned by the {@code @RestControllerAdvice} handler.
 */
public record ErrorResponse(int status,
                            String error,
                            String message,
                            String path,
                            Map<String, String> fieldErrors,
                            Instant timestamp) {

    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(status, error, message, path, Map.of(), Instant.now());
    }

    public static ErrorResponse of(int status, String error, String message, String path,
                                   Map<String, String> fieldErrors) {
        return new ErrorResponse(status, error, message, path, fieldErrors, Instant.now());
    }
}
