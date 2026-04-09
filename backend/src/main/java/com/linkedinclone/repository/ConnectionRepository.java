package com.linkedinclone.repository;

import com.linkedinclone.entity.Connection;
import com.linkedinclone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    
    @Query("SELECT c FROM Connection c WHERE (c.sender = :user OR c.receiver = :user) AND c.status = 'ACCEPTED'")
    List<Connection> findAcceptedConnections(@Param("user") User user);
    
    List<Connection> findByReceiverAndStatus(User receiver, Connection.ConnectionStatus status);
    
    @Query("SELECT c FROM Connection c WHERE (c.sender = :u1 AND c.receiver = :u2) OR (c.sender = :u2 AND c.receiver = :u1)")
    Optional<Connection> findBetweenUsers(@Param("u1") User u1, @Param("u2") User u2);

    Optional<Connection> findBySenderAndReceiver(User sender, User receiver);

    List<Connection> findBySenderAndStatus(User sender, Connection.ConnectionStatus status);
    
    List<Connection> findBySender(User sender);
}
