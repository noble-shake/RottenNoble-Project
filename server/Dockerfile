# server/Dockerfile — 멀티 스테이지 빌드. NAS엔 Java/Maven이 없어서 빌드 자체를 컨테이너
# 안에서 하고(build 스테이지), 실행 이미지엔 JRE와 산출물 jar만 남긴다(runtime 스테이지) —
# 지금 프런트를 로컬에서 빌드해 NAS로 올리는 수동 절차와 비슷하게, 이 이미지도 로컬(또는
# CI)에서 빌드해서 NAS의 Docker로 올리는 흐름을 가정한다.

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
