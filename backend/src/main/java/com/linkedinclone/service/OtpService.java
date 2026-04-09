package com.linkedinclone.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final Map<String, OtpData> otpMap = new ConcurrentHashMap<>();
    private static final long OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpMap.put(email, new OtpData(otp, System.currentTimeMillis() + OTP_EXPIRY_MS));
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        OtpData data = otpMap.get(email);
        if (data == null) return false;
        
        if (System.currentTimeMillis() > data.expiryTime) {
            otpMap.remove(email);
            return false;
        }
        
        boolean isValid = data.otp.equals(otp);
        if (isValid) {
            // Keep it for the next step (password reset) but we could also mark it as verified
        }
        return isValid;
    }

    public void clearOtp(String email) {
        otpMap.remove(email);
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
