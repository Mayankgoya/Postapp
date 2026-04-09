package com.linkedinclone.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String to, String otp) {
        System.out.println("\n=========================================");
        System.out.println("🔔 OTP FOR " + to + " IS: " + otp + " 🔔");
        System.out.println("=========================================\n");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("OTP Verification - PostApp");
            message.setText("Your OTP is: " + otp + "\nThis code will expire in 5 minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Warning: Failed to send real email via SMTP. Please use the OTP printed above for local testing.");
        }
    }
}
