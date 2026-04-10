package com.linkedinclone.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final Map<String, OtpData> otpMap = new ConcurrentHashMap<>();
    private static final long OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

    public String generateOtp(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpMap.put(normalizedEmail, new OtpData(otp, System.currentTimeMillis() + OTP_EXPIRY_MS));
        System.out.println("[OTP] Generated OTP for " + normalizedEmail + ": " + otp);
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        String normalizedEmail = email.toLowerCase().trim();
        OtpData data = otpMap.get(normalizedEmail);
        
        if (data == null) {
            System.out.println("[OTP] Verification failed: No OTP found for " + normalizedEmail);
            return false;
        }
        
        if (System.currentTimeMillis() > data.expiryTime) {
            System.out.println("[OTP] Verification failed: OTP expired for " + normalizedEmail);
            otpMap.remove(normalizedEmail);
            return false;
        }
        
        boolean isValid = data.otp.equals(otp);
        if (!isValid) {
            System.out.println("[OTP] Verification failed: Mismatched OTP for " + normalizedEmail + ". Expected: " + data.otp + ", Got: " + otp);
        } else {
            System.out.println("[OTP] Verification successful for " + normalizedEmail);
        }
        return isValid;
    }

    public void clearOtp(String email) {
        otpMap.remove(email.toLowerCase().trim());
    }

    private static class OtpData {
        String otp;
        long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}
