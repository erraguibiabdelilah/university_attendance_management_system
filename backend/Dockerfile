# Étape 1 : build Maven
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /backend

COPY . .

RUN mvn clean package -DskipTests

# Étape 2 : run
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /backend

COPY --from=build /backend/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
