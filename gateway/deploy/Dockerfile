FROM eclipse-temurin:17-jre
WORKDIR /app
COPY gateway/gateway-service/target/gateway-service-*.jar app.jar
EXPOSE 9200
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
