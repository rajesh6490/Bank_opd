package com.bank.demo.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "zeinekhnQP5icBDJNHjMb+sGrAUc5ZoNhs5WNl91zF4=";
    private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 hour

    /**
     * Generates a JWT token with additional claims.
     *
     * @param claims A map containing the claims to include in the token.
     * @return The generated JWT token.
     */
    public String generateToken(Map<String, Object> claims) {
        try {
            return Jwts.builder()
                    .claims(claims)
                    .issuedAt(new Date(System.currentTimeMillis()))
                    .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                    .signWith(getSignInKey(), Jwts.SIG.HS256)
                    .compact();
        } catch (Exception e) {
            System.err.println("Error while generating token: " + e.getMessage());
            e.printStackTrace(System.out);
            return null; // or handle this scenario as needed
        }
    }


    /**
     * Extracts the username from the token.
     *
     * @param token The JWT token.
     * @return The username.
     */
    public String extractUsername(String token) {
        return extractClaim(token, claims -> claims.get("username", String.class));
    }

    /**
     * Extracts the account number from the token.
     *
     * @param token The JWT token.
     * @return The account number.
     */
    public String extractAccountNumber(String token) {
        return extractClaim(token, claims -> claims.get("accountNumber", String.class));
    }

    /**
     * Extracts the email from the token.
     *
     * @param token The JWT token.
     * @return The email.
     */
    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    /**
     * Validates the token for expiration and signature correctness.
     *
     * @param token The JWT token.
     * @return True if the token is valid, false otherwise.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("Token expired");
        } catch (MalformedJwtException e) {
            System.out.println("Invalid token");
        } catch (UnsupportedJwtException e) {
            System.out.println("Token not supported");
        } catch (IllegalArgumentException e) {
            System.out.println("Token claims string is empty");
        }
        return false;
    }

    /**
     * Extracts a specific claim from the token.
     *
     * @param token The JWT token.
     * @param claimsResolver A function to resolve the claim.
     * @param <T> The type of the claim.
     * @return The extracted claim.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from the token.
     *
     * @param token The JWT token.
     * @return All claims contained in the token.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Returns the secret key for signing JWT tokens.
     *
     * @return The secret key.
     */
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
