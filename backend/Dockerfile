# --- Build stage: compile the Spring Boot jar with Maven (no wrapper needed) ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -B -DskipTests package

# --- Run stage: slim JRE image running the jar ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# The platform (Render/Cloud Run/etc.) injects PORT; the app binds to it.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
