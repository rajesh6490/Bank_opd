package com.bank.demo.service;

import com.bank.demo.entity.User;
import com.bank.demo.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    @Autowired
    private EmailService emailService;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public double getBalance(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getBalance();
    }

    public User createUser(User user) {
        // Encrypt the password before saving
        String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(hashedPassword);

        user.setAccountNumber("xxxxxxxxxx");
        user.setVerified(false);
        // Save the user first to assign an ID
        User savedUser = userRepository.save(user);

        // Generate account number after saving (based on the assigned ID)
        String accountNumber = generateAccountNumber(savedUser.getId());
        savedUser.setAccountNumber(accountNumber);

        User fin = userRepository.save(savedUser);
        sendVerificationEmail(fin);

        return fin;
    }

    private String generateAccountNumber(Long id) {
        String yearPrefix = String.valueOf(Year.now().getValue()).substring(2); // Last 2 digits of the year
        String uniqueSuffix = String.format("%08d", id); // Zero-padding up to 8 digits
        return yearPrefix + uniqueSuffix;
    }

    public boolean doesUserExist(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public User doesAccountNumberExist(String accountNumber) {
        User user = userRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        return user;
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Invalid username"));
    }

    public User login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // Check if the password matches the hashed password stored in the database
        if (!BCrypt.checkpw(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        return user;
    }

    public void verifyUser(String accountNumber) {
        User user = userRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update user verification status
        user.setVerified(true);
        userRepository.save(user);
    }

    private void sendVerificationEmail(User user) {
        String verificationLink = "http://localhost:8080/api/users/verify/" + user.getAccountNumber();

        String emailBody = "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "<h2 style='color: #4CAF50;'>Account Verification</h2>" +
                "<p>Dear <strong>" + user.getUsername() + "</strong>,</p>" +
                "<p>Welcome to Digi Banking! Please find your account details below:</p>" +
                "<table style='width: 100%; border: 1px solid #ddd; border-collapse: collapse; margin: 20px 0;'>" +
                "<tr style='background-color: #f4f4f4;'>" +
                "<th style='padding: 10px; text-align: left; border: 1px solid #ddd;'>Account Number</th>" +
                "<td style='padding: 10px; text-align: left; border: 1px solid #ddd;'>" + user.getAccountNumber() + "</td>" +
                "</tr>" +
                "<tr>" +
                "<th style='padding: 10px; text-align: left; border: 1px solid #ddd;'>Username</th>" +
                "<td style='padding: 10px; text-align: left; border: 1px solid #ddd;'>" + user.getUsername() + "</td>" +
                "</tr>" +
                "<tr style='background-color: #f4f4f4;'>" +
                "<th style='padding: 10px; text-align: left; border: 1px solid #ddd;'>Email</th>" +
                "<td style='padding: 10px; text-align: left; border: 1px solid #ddd;'>" + user.getEmail() + "</td>" +
                "</tr>" +
                "</table>" +
                "<p style='font-size: 16px;'>To complete the verification process, please click the button below:</p>" +
                "<p><a href='" + verificationLink + "' style='background-color: #4CAF50; color: white; padding: 15px 25px; text-align: center; text-decoration: none; border-radius: 5px; font-size: 16px;'>Verify Your Account</a></p>" +
                "<p style='font-size: 14px;'>If you did not request this verification, please ignore this email.</p>" +
                "<p>Thank you for choosing Digi Banking!</p>" +
                "</body></html>";

        emailService.sendHtmlEmail(user.getEmail(), "Account Verification", emailBody);
    }

}
