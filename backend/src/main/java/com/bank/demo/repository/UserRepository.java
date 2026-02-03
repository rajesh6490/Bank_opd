package com.bank.demo.repository;

import com.bank.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    boolean existsByMpinAndId(String mpin, Long id);

    Optional<User> findByAccountNumber(String accountNumber);

    boolean existsByEmail(String email);

    List<User> findByVerifiedTrue();

    List<User> findByVerifiedFalse();

    @Query("SELECT u FROM User u WHERE u.username = :username OR u.email = :email")
    Optional<User> findByUsernameOrEmail(@Param("username") String username, @Param("email") String email);
}
