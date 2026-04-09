package com.linkedinclone.service;

import com.linkedinclone.dto.PendingRequestDto;
import com.linkedinclone.dto.UserDto;
import com.linkedinclone.entity.Connection;
import com.linkedinclone.entity.User;
import com.linkedinclone.repository.ConnectionRepository;
import com.linkedinclone.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;

    public ConnectionService(ConnectionRepository connectionRepository, UserRepository userRepository) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
    }

    public String sendRequest(String senderEmail, Long receiverId, String message) {
        User sender = userRepository.findByEmail(senderEmail).orElseThrow();
        User receiver = userRepository.findById(receiverId).orElseThrow();

        if (connectionRepository.findBySenderAndReceiver(sender, receiver).isPresent()) {
            return "Request already sent";
        }

        Connection connection = new Connection();
        connection.setSender(sender);
        connection.setReceiver(receiver);
        connection.setMessage(message);
        connection.setStatus(Connection.ConnectionStatus.PENDING);
        connectionRepository.save(connection);

        return "Connection request sent";
    }

    public List<UserDto> getConnections(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Connection> connections = connectionRepository.findAcceptedConnections(user);

        return connections.stream()
                .map(c -> c.getSender().getId().equals(user.getId()) ? c.getReceiver() : c.getSender())
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public List<PendingRequestDto> getPendingRequests(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return connectionRepository.findByReceiverAndStatus(user, Connection.ConnectionStatus.PENDING)
                .stream().map(c -> new PendingRequestDto(new UserDto(c.getSender()), c.getMessage())).collect(Collectors.toList());
    }

    public String acceptRequest(String email, Long senderId) {
        User receiver = userRepository.findByEmail(email).orElseThrow();
        User sender = userRepository.findById(senderId).orElseThrow();

        Connection connection = connectionRepository.findBySenderAndReceiver(sender, receiver)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        connection.setStatus(Connection.ConnectionStatus.ACCEPTED);
        connectionRepository.save(connection);

        return "Request accepted";
    }

    public String getConnectionStatus(String currentUserEmail, Long targetUserId) {
        User currentUser = userRepository.findByEmail(currentUserEmail).orElseThrow();
        User targetUser = userRepository.findById(targetUserId).orElseThrow();

        return connectionRepository.findBetweenUsers(currentUser, targetUser)
                .map(c -> c.getStatus().toString())
                .orElse("NONE");
    }

    public List<UserDto> getConnectionsById(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<Connection> connections = connectionRepository.findAcceptedConnections(user);

        return connections.stream()
                .map(c -> c.getSender().getId().equals(user.getId()) ? c.getReceiver() : c.getSender())
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public List<Long> getSentRequestIds(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return connectionRepository.findBySenderAndStatus(user, Connection.ConnectionStatus.PENDING)
                .stream().map(c -> c.getReceiver().getId()).collect(Collectors.toList());
    }
}
