package com.bank.demo.service;

import com.bank.demo.entity.Transaction;
import com.bank.demo.entity.User;
import com.bank.demo.repository.TransactionRepository;
import com.bank.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public TransactionService(UserRepository userRepository, TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public String processTransaction(String fromAccount, String toAccount, Double amount, String mpin) {
        // Validate sender
        User sender = userRepository.findByAccountNumber(fromAccount)
                .orElseThrow(() -> new RuntimeException("Sender account not found"));

        if (!sender.getMpin().equals(mpin)) {
            throw new RuntimeException("Invalid MPIN");
        }

        if (sender.getBalance() < amount) {
            throw new RuntimeException("Insufficient funds");
        }

        // Validate recipient
        User recipient = userRepository.findByAccountNumber(toAccount)
                .orElseThrow(() -> new RuntimeException("Recipient account not found"));

        // Deduct from sender
        sender.setBalance(sender.getBalance() - amount);
        userRepository.save(sender);

        // Add to recipient
        recipient.setBalance(recipient.getBalance() + amount);
        userRepository.save(recipient);

        // Log sender transaction
        Transaction senderTransaction = new Transaction();
        senderTransaction.setUser(sender);
        senderTransaction.setAmount(amount);
        senderTransaction.setType("DEBIT");
        senderTransaction.setStatus("SUCCESS");
        senderTransaction.setDescription(String.format("Transfer to %s (Account: %s)", recipient.getUsername(), toAccount));
        senderTransaction.setTimestamp(LocalDateTime.now());
        transactionRepository.save(senderTransaction);

        // Log recipient transaction
        Transaction recipientTransaction = new Transaction();
        recipientTransaction.setUser(recipient);
        recipientTransaction.setAmount(amount);
        recipientTransaction.setType("CREDIT");
        recipientTransaction.setStatus("SUCCESS");
        recipientTransaction.setDescription(String.format("Received from %s (Account: %s)", sender.getUsername(), fromAccount));
        recipientTransaction.setTimestamp(LocalDateTime.now());
        transactionRepository.save(recipientTransaction);

        return "Transaction successful";
    }

    public List<Transaction> getAllTransactionsByAccountNumber(String accountNumber) {
        return transactionRepository.findByUserAccountNumber(accountNumber);
    }
}
