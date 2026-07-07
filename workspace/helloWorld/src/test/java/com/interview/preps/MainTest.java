package com.interview.preps;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MainTest {

    @Test
    void greetingReturnsExpectedMessage() {
        assertEquals("Hello, World!", Main.greeting());
    }
}
