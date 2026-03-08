package com.lifesync.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String frontendBaseUrl;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username:}") String fromEmail,
                        @Value("${app.frontend.base-url:https://life-sync-wine.vercel.app}") String frontendBaseUrl) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public boolean sendOtpEmail(String toEmail, String otp) {
        String subject = "LifeSync Email Verification OTP";
        String body = "Your LifeSync verification OTP is: " + otp + "\n\n"
                + "This OTP expires in 10 minutes.\n\n"
                + "If you did not request this, please ignore this email.";
        return sendEmail(toEmail, subject, body);
    }

    public boolean sendInvitationEmail(String toEmail, String inviteToken, String familyName, String inviterName) {
        String inviteUrl = frontendBaseUrl + "/register?inviteToken=" + inviteToken;
        String subject = "You're invited to join " + familyName + " on LifeSync";
        String body = "Hi,\n\n"
                + inviterName + " invited you to join the family workspace \"" + familyName + "\" on LifeSync.\n\n"
                + "Use this invite token: " + inviteToken + "\n"
                + "Or open this link: " + inviteUrl + "\n\n"
                + "This invitation expires in 7 days.";
        return sendEmail(toEmail, subject, body);
    }

    private boolean sendEmail(String toEmail, String subject, String body) {
        if (fromEmail == null || fromEmail.isBlank()) {
            logger.warn("Mail sender is not configured. Skipping email send to {}", toEmail);
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            return true;
        } catch (Exception ex) {
            logger.warn("Failed to send email to {}: {}", toEmail, ex.getMessage());
            return false;
        }
    }
}
