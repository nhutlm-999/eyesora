package vn.edu.fpt.eyesora;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EyesoraApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("eyesora-be")
                .ignoreIfMissing()
                .load();

        // Load environment variables from .env file into system properties
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );
        SpringApplication.run(EyesoraApplication.class, args);
    }

}
