package eu.geoknow.generator.utils;

import javax.mail.MessagingException;

public interface EmailSender {
    public void send(String toEmail, String msgSubject, String msgText) throws MessagingException;
}
