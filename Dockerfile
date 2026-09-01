FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY backend/target/keystone-1.0.0.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx400m -Xms200m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
