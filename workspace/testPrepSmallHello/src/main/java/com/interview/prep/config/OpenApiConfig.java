package com.interview.prep.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger UI metadata. Swagger UI is served at {@code /swagger-ui.html}.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI testPrepSmallHelloOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("testPrepSmallHello API")
                        .description("Industrial-grade polyglot-persistence microservice (PostgreSQL + MongoDB)")
                        .version("1.0.0")
                        .contact(new Contact().name("Interview Prep").email("prep@interview.com"))
                        .license(new License().name("Proprietary")));
    }
}
