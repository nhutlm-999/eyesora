package vn.edu.fpt.eyesora.filters;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.edu.fpt.eyesora.service.impl.UserDetailsService;
import vn.edu.fpt.eyesora.util.JwtUtil;


import java.io.IOException;
import java.security.SignatureException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {


        
        String path = req.getRequestURI();
        if (path.startsWith("/api/auth/") && !path.equals("/api/auth/me") && !path.equals("/api/auth/logout")) {
            chain.doFilter(req, res);
            return;
        }

        String token = null;
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        } else if (req.getCookies() != null) {
            for (jakarta.servlet.http.Cookie c : req.getCookies()) {
                if ("accessToken".equals(c.getName())) {
                    token = c.getValue();
                    break;
                }
            }
        }

        if (token == null) {
            chain.doFilter(req, res);
            return;
        }


        try {
            String username = jwtUtil.extractUsername(token);
            String source = jwtUtil.extractSource(token);


            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails user = userDetailsService.loadUserByUsername(username);
                

                if (jwtUtil.isValid(token, user)) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            user, null, user.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (ExpiredJwtException e) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.setContentType("application/json");
            res.getWriter().write("""
                    {
                      "status":401,
                      "code":"ACCESS_TOKEN_EXPIRED",
                      "message":"Access token expired"
                    }
                    """);
            return;

        } catch (MalformedJwtException | IllegalArgumentException e) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.setContentType("application/json");
            res.getWriter().write("""
                    {
                      "status":401,
                      "code":"INVALID_ACCESS_TOKEN",
                      "message":"Invalid access token"
                    }
                    """);
            return;
        }


        chain.doFilter(req, res);
    }
}