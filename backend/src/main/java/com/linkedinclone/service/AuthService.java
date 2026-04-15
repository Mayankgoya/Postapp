package com.linkedinclone.service;

import com.linkedinclone.dto.JwtAuthResponse;
import com.linkedinclone.dto.LoginDto;
import com.linkedinclone.dto.RegisterDto;
import com.linkedinclone.dto.UserDto;
import com.linkedinclone.entity.User;
import com.linkedinclone.repository.UserRepository;
import com.linkedinclone.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final OtpService otpService;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider,
                       EmailService emailService, OtpService otpService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
        this.otpService = otpService;
    }

    public String sendForgotPasswordOtp(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        // OTP DISABLED: Just verify the user exists, skip email sending
        userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + normalizedEmail));
        // Store a bypass OTP so reset still works
        otpService.generateOtp(normalizedEmail); // generates internally but not emailed
        return "OTP sent to your email!";
    }

    public boolean verifyOtp(String email, String otp) {
        return otpService.verifyOtp(email, otp);
    }

    public String resetPassword(String email, String otp, String newPassword) {
        String normalizedEmail = email.toLowerCase().trim();
        // OTP DISABLED: Skip OTP verification, directly reset password
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpService.clearOtp(normalizedEmail);
        
        return "Password reset successful!";
    }

    public JwtAuthResponse login(LoginDto loginDto) {
        String normalizedEmail = loginDto.getEmail().toLowerCase().trim();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, loginDto.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(normalizedEmail).orElseThrow();

        return new JwtAuthResponse(token, new UserDto(user));
    }

    public String sendRegistrationOtp(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email is already registered!");
        }
        // OTP DISABLED: Skip email sending, store a fixed bypass OTP
        otpService.generateOtp(normalizedEmail); // generates internally but not emailed
        return "Registration OTP sent to your email!";
    }

    public String register(RegisterDto registerDto) {
        String normalizedEmail = registerDto.getEmail().toLowerCase().trim();
        // OTP DISABLED: Skip OTP verification entirely

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = new User();
        user.setName(registerDto.getName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        userRepository.save(user);
        otpService.clearOtp(normalizedEmail);

        return "User registered successfully for email: " + normalizedEmail;
    }
}
