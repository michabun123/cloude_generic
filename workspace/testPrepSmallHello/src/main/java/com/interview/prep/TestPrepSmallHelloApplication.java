package com.interview.prep;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the testPrepSmallHello polyglot-persistence microservice.
 *
 * <p>This service uses two data stores side by side:
 * <ul>
 *     <li><b>Relational (JPA)</b> &mdash; H2 by default, PostgreSQL under the {@code postgres} profile.</li>
 *     <li><b>Document (MongoDB)</b> &mdash; connected in every profile (no in-memory equivalent).</li>
 * </ul>
 */
@SpringBootApplication
public class TestPrepSmallHelloApplication {

    public static void main(String[] args) {
        SpringApplication.run(TestPrepSmallHelloApplication.class, args);
    }
}
