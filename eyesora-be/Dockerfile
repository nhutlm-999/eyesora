FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
RUN ./mvnw package -DskipTests

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "target/eyesora-0.0.1-SNAPSHOT.jar"]

