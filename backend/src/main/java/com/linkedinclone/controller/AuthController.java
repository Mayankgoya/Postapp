package com.linkedinclone.controller;

import com.linkedinclone.dto.JwtAuthResponse;
import com.linkedinclone.dto.LoginDto;
import com.linkedinclone.dto.RegisterDto;
import com.linkedinclone.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginDto loginDto) {
        return ResponseEntity.ok(authService.login(loginDto));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDto registerDto) {
        return ResponseEntity.ok(authService.register(registerDto));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        return ResponseEntity.ok(authService.sendForgotPasswordOtp(email));
    }

    @PostMapping("/registration-otp")
    public ResponseEntity<String> registrationOtp(@RequestParam String email) {
        return ResponseEntity.ok(authService.sendRegistrationOtp(email));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Boolean> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        return ResponseEntity.ok(authService.verifyOtp(email, otp));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody com.linkedinclone.dto.ResetPasswordDto resetPasswordDto) {
        return ResponseEntity.ok(authService.resetPassword(
            resetPasswordDto.getEmail(), 
            resetPasswordDto.getOtp(), 
            resetPasswordDto.getNewPassword()
        ));
    }
}
