# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy the pom.xml and download dependencies to optimize caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Find the generated JAR (ignoring any original/plain jars if present) 
# and rename it to a consistent name for the next stage
RUN find target -name "*.jar" ! -name "*-plain.jar" ! -name "*-javadoc.jar" ! -name "*-sources.jar" -exec cp {} target/app.jar \;

# Stage 2: Prepare the runtime environment
FROM eclipse-temurin:17-jre-alpine

# Security Hardening: Create a non-root user and group
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy the fat jar from the builder stage
COPY --from=builder --chown=spring:spring /app/target/app.jar app.jar

# Switch to the non-root user
USER spring

# Expose the application port
EXPOSE 8080

# Define the entrypoint
ENTRYPOINT ["java", "-jar", "app.jar"]
