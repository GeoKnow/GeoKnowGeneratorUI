package eu.geoknow.generator.utils;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

public class SSLEmailSender implements EmailSender {
    private String smtpHost;
    private String smtpPort;
    private String fromEmail;
    private String emailUsername;
    private String emailPassword;

    public SSLEmailSender(String smtpHost, String smtpPort, String fromEmail, String emailUsername, String emailPassword) {
        this.smtpHost = smtpHost;
        this.smtpPort = smtpPort;
        this.fromEmail = fromEmail;
        this.emailUsername = emailUsername;
        this.emailPassword = emailPassword;
    }

    public void send(String toEmail, String msgSubject, String msgText) throws MessagingException {
        Properties props = new Properties();
        props.put("mail.smtp.host", smtpHost);
        props.put("mail.smtp.socketFactory.port", smtpPort);
        props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.port", smtpPort);

        Session session = Session.getDefaultInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(emailUsername, emailPassword);
                    }
                });

        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(fromEmail));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
        message.setSubject(msgSubject);
        message.setText(msgText);

        Transport.send(message);
    }
}
