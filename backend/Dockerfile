FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/keystone-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
