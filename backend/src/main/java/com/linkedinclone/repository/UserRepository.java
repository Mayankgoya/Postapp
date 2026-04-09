package com.linkedinclone.repository;

import com.linkedinclone.entity.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByNameContainingIgnoreCase(String name);

    @Query("SELECT u FROM User u " +
           "ORDER BY ((SELECT COUNT(c) FROM Connection c WHERE (c.sender.id = u.id OR c.receiver.id = u.id) AND c.status = 'ACCEPTED') + u.searchCount) DESC")
    List<User> findTrendingUsers(Pageable pageable);
}
