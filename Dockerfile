# Stage 1: Dependency Analysis & Construction Runtime Compilation
FROM maven:3.8.5-openjdk-17-slim AS structural-builder
WORKDIR /build/app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimalist Lightweight Clean Image Architecture Execution
FROM openjdk:17-jdk-slim
WORKDIR /runtime/app
COPY --from=structural-builder /build/app/target/*.jar runtime-engine.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "runtime-engine.jar"]