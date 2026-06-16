FROM eclipse-temurin:17-jre
WORKDIR /app
COPY sys/sys-service/target/sys-service-*.jar app.jar
EXPOSE 9201
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
