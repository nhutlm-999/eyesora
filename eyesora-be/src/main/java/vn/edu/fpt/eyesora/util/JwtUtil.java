package vn.edu.fpt.eyesora.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import vn.edu.fpt.eyesora.entity.User;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JwtUtil {
    @Value("${JWT_SECRET_KEY}") private String secret;
    @Value("${JWT_ACCESS_EXPIRES_IN}") private long expMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateToken(UserDetails userDetails) {
        String source = "user";

        User user = (User) userDetails;

        String id = user.getId();
        String name = user.getFull_name();
        Set<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());


        return Jwts.builder()
                .subject(user.getUsername())
                .claim("id", id)
                .claim("name", name)
                .claim("roles", roles)
                .claim("source", source)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expMs))
                .signWith(key())
                .compact();
    }

    public String extractUsername(String token) {
        return claims(token).getSubject();
    }

    public String extractSource(String token) {
        return claims(token).get("source", String.class);
    }

    public boolean isValid(String token, UserDetails user) {
        return extractUsername(token).equals(user.getUsername())
                && !claims(token).getExpiration().before(new Date());
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload();
    }


}
