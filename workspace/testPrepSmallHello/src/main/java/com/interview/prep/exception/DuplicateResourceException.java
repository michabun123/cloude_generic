package com.interview.prep.exception;

/**
 * Thrown when creating a resource that violates a uniqueness constraint. Mapped to HTTP 409.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public static DuplicateResourceException of(String resource, String field, Object value) {
        return new DuplicateResourceException(
                "%s with %s '%s' already exists".formatted(resource, field, value));
    }
}
