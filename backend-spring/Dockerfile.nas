# 로컬에서 미리 빌드한 jar를 그대로 담는 런타임 전용 이미지.
# NAS에서 직접 Maven 빌드를 돌리지 않고(느리고 인터넷 의존적), 로컬에서 만든
# target/backend-0.0.1-SNAPSHOT.jar를 scp로 옮긴 뒤 이 Dockerfile로만 이미지를 만든다.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
