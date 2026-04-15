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

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public String resetPassword(String email, String newPassword) {
        String normalizedEmail = email.toLowerCase().trim();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
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

    public String register(RegisterDto registerDto) {
        String normalizedEmail = registerDto.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = new User();
        user.setName(registerDto.getName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        userRepository.save(user);

        return "User registered successfully for email: " + normalizedEmail;
    }
}
