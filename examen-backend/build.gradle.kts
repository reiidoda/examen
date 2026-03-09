plugins {
	java
	id("org.springframework.boot") version "4.0.0"
	id("io.spring.dependency-management") version "1.1.7"
	id("org.flywaydb.flyway") version "10.8.1"
}

group = "com.rei"
version = "0.0.1-SNAPSHOT"
description = "examen-backend"

java {
	toolchain {
		// Use Java 25 as in the original setup
		languageVersion = JavaLanguageVersion.of(25)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

flyway {
    val defaultUrl = System.getenv("SPRING_DATASOURCE_URL") ?: "jdbc:postgresql://localhost:5432/examen"
    val defaultUser = System.getenv("SPRING_DATASOURCE_USERNAME") ?: "postgres"
    val defaultPass = System.getenv("SPRING_DATASOURCE_PASSWORD") ?: "postgres"
    url = defaultUrl
    user = defaultUser
    password = defaultPass
    schemas = arrayOf("public")
    locations = arrayOf("classpath:db/migration")
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.flywaydb:flyway-core")
    implementation("org.apache.pdfbox:pdfbox:3.0.2")


    // JWT Dependencies
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    implementation("io.jsonwebtoken:jjwt-impl:0.11.5")
    implementation("io.jsonwebtoken:jjwt-jackson:0.11.5")

	compileOnly("org.projectlombok:lombok")
	runtimeOnly("org.postgresql:postgresql")
	annotationProcessor("org.projectlombok:lombok")
	testAnnotationProcessor("org.projectlombok:lombok")
    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-test-autoconfigure")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("com.h2database:h2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

}

tasks.withType<Test> {
	useJUnitPlatform()
}
