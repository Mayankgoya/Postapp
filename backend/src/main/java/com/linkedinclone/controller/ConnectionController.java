package com.linkedinclone.controller;

import com.linkedinclone.dto.PendingRequestDto;
import com.linkedinclone.dto.UserDto;
import com.linkedinclone.service.ConnectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<String> sendRequest(@PathVariable Long receiverId, @RequestBody(required = false) java.util.Map<String, String> payload, Authentication authentication) {
        String message = payload != null ? payload.get("message") : null;
        return ResponseEntity.ok(connectionService.sendRequest(authentication.getName(), receiverId, message));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getConnections(Authentication authentication) {
        return ResponseEntity.ok(connectionService.getConnections(authentication.getName()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PendingRequestDto>> getPendingRequests(Authentication authentication) {
        return ResponseEntity.ok(connectionService.getPendingRequests(authentication.getName()));
    }

    @PostMapping("/accept/{senderId}")
    public ResponseEntity<String> acceptRequest(@PathVariable Long senderId, Authentication authentication) {
        return ResponseEntity.ok(connectionService.acceptRequest(authentication.getName(), senderId));
    }

    @GetMapping("/status/{targetId}")
    public ResponseEntity<String> getStatus(@PathVariable Long targetId, Authentication authentication) {
        return ResponseEntity.ok(connectionService.getConnectionStatus(authentication.getName(), targetId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserDto>> getConnectionsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(connectionService.getConnectionsById(userId));
    }

    @GetMapping("/sent-ids")
    public ResponseEntity<List<Long>> getSentRequestIds(Authentication authentication) {
        return ResponseEntity.ok(connectionService.getSentRequestIds(authentication.getName()));
    }
}
