# Stage 1: Build the package jar securely
FROM maven:3.8.5-openjdk-17-slim AS structural-builder
WORKDIR /build/app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Clean, Maintained Production Image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /runtime/app
COPY --from=structural-builder /build/app/target/*.jar runtime-engine.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "runtime-engine.jar"]