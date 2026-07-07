package com.interview.prep.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.Map;

/**
 * Inbound payload for the flexible-schema Mongo document.
 *
 * <p>Typed core fields plus an {@code attributes} catch-all for arbitrary extras.
 */
public record SmallTestRequest(

        @NotBlank(message = "name must not be blank")
        String name,

        String familyName,

        @Email(message = "email must be a valid address")
        String email,

        String phone,

        Map<String, Object> attributes
) {
}
