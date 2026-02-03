package com.bank.demo.controller;

import com.bank.demo.dto.UserData;
import com.bank.demo.entity.User;
import com.bank.demo.service.UserService;
import com.bank.demo.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;
    @Autowired
    private JwtUtil jwtUtil;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/reg")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        try {
            if (userService.doesUserExist(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User already exists");
            }

            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully");

        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while creating the user");
        }
    }

    @GetMapping("/balance")
    public double getBalance(@RequestHeader("Authorization") String token) {
        String jwtToken = token.startsWith("Bearer ") ? token.substring(7) : token;
        String username = jwtUtil.extractUsername(jwtToken);
        return userService.getBalance(username);
    }

    @GetMapping("/check/{accountNumber}")
    public ResponseEntity<Object> checkAccountNumber(@PathVariable String accountNumber) {
        try {
            User user = userService.doesAccountNumberExist(accountNumber);
            UserData userData = new UserData();
            userData.setUsername(user.getUsername());
            userData.setEmail(user.getEmail());
            userData.setAccountNumber(user.getAccountNumber());
            userData.setVerified(user.getVerified());
            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @GetMapping("/verify/{accountNumber}")
    public ResponseEntity<String> verifyUser(@PathVariable String accountNumber) {
        try {
            userService.verifyUser(accountNumber);

            // HTML layout for success message
            String htmlResponse = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account Verified</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: #f0f8ff;
                    }
                    .container {
                        text-align: center;
                        padding: 2rem;
                        background: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    }
                    .container h1 {
                        color: #4CAF50;
                        margin-bottom: 1rem;
                    }
                    .container p {
                        font-size: 1.2rem;
                        color: #333;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Account Verified Successfully</h1>
                    <p>Your account with number <strong>%s</strong> has been verified.</p>
                </div>
            </body>
            </html>
        """.formatted(accountNumber);

            return ResponseEntity.ok()
                    .header("Content-Type", "text/html")
                    .body(htmlResponse);
        } catch (Exception e) {
            String errorResponse = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verification Failed</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: #ffe6e6;
                    }
                    .container {
                        text-align: center;
                        padding: 2rem;
                        background: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    }
                    .container h1 {
                        color: #FF0000;
                        margin-bottom: 1rem;
                    }
                    .container p {
                        font-size: 1.2rem;
                        color: #333;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Verification Failed</h1>
                    <p>%s</p>
                </div>
            </body>
            </html>
        """.formatted(e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .header("Content-Type", "text/html")
                    .body(errorResponse);
        }
    }


    @GetMapping("/getUser")
    public ResponseEntity<Object> getUser(@RequestHeader("Authorization") String token) {
        try {

            String jwtToken = token.startsWith("Bearer ") ? token.substring(7) : token;

            String username = jwtUtil.extractUsername(jwtToken);
            User user = userService.getUserByUsername(username);

            // Create response DTO
            UserData userData = new UserData();
            userData.setId(user.getId());
            userData.setUsername(user.getUsername());
            userData.setEmail(user.getEmail());
            userData.setMpin(user.getMpin());
            userData.setAccountNumber(user.getAccountNumber());
            userData.setVerified(user.getVerified());

            return ResponseEntity.ok(userData);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestParam String username, @RequestParam String password) {
        try {
            User user = userService.login(username, password);
            Map<String, Object> claims = Map.of(
                    "username", user.getUsername(),
                    "accountNumber", user.getAccountNumber(),
                    "email", user.getEmail()
            );
            String token = jwtUtil.generateToken(claims);
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

}
