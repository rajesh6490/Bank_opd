package com.bank.demo.controller;

import com.bank.demo.dto.TransactionRequest;
import com.bank.demo.entity.Transaction;
import com.bank.demo.service.TransactionService;
import com.bank.demo.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    private final TransactionService transactionService;
    @Autowired
    private JwtUtil jwtUtil;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/getList")
    public List<Transaction> getTransactionsByAccountNumber(@RequestHeader("Authorization") String token) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;

        // Extract account number from the token
        String accountNumber = jwtUtil.extractAccountNumber(jwt);
        return transactionService.getAllTransactionsByAccountNumber(accountNumber);
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transferFunds(@RequestHeader("Authorization") String token, @RequestBody TransactionRequest transactionRequest) {
        try {

            String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
            String accountNumber = jwtUtil.extractAccountNumber(jwt);

            String message = transactionService.processTransaction(
                    accountNumber,
                    transactionRequest.getToAccount(),
                    transactionRequest.getAmount(),
                    transactionRequest.getMpin());
            return ResponseEntity.ok(message);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
