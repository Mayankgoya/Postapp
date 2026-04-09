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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);
        return "OTP sent to your email!";
    }

    public boolean verifyOtp(String email, String otp) {
        return otpService.verifyOtp(email, otp);
    }

    public String resetPassword(String email, String otp, String newPassword) {
        if (!otpService.verifyOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP!");
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpService.clearOtp(email);
        
        return "Password reset successful!";
    }

    public JwtAuthResponse login(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(loginDto.getEmail()).orElseThrow();

        return new JwtAuthResponse(token, new UserDto(user));
    }

    public String sendRegistrationOtp(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered!");
        }
        
        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);
        return "Registration OTP sent to your email!";
    }

    public String register(RegisterDto registerDto) {
        if (!otpService.verifyOtp(registerDto.getEmail(), registerDto.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP!");
        }

        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = new User();
        user.setName(registerDto.getName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        userRepository.save(user);
        otpService.clearOtp(registerDto.getEmail());

        return "User registered successfully for email: " + registerDto.getEmail();
    }
}
