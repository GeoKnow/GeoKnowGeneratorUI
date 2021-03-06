package eu.geoknow.generator.utils;

import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class TLSEmailSender implements EmailSender {
  private String smtpHost;
  private String smtpPort;
  private String fromEmail;
  private String emailUsername;
  private String emailPassword;

  public TLSEmailSender(String smtpHost, String smtpPort, String fromEmail, String emailUsername,
      String emailPassword) {
    this.smtpHost = smtpHost;
    this.smtpPort = smtpPort;
    this.fromEmail = fromEmail;
    this.emailUsername = emailUsername;
    this.emailPassword = emailPassword;
  }

  public void send(String toEmail, String msgSubject, String msgText) throws MessagingException {
    Properties props = new Properties();
    props.put("mail.smtp.starttls.enable", "true");
    props.put("mail.smtp.host", smtpHost);
    props.put("mail.smtp.port", smtpPort);

    Session session;

    if (emailUsername == null || emailUsername.isEmpty())
      session = Session.getDefaultInstance(props);
    else {
      props.put("mail.smtp.auth", "true");
      props.setProperty("mail.mime.address.strict", "false");
      session = Session.getInstance(props, new Authenticator() {
        protected PasswordAuthentication getPasswordAuthentication() {
          return new PasswordAuthentication(emailUsername, emailPassword);
        }
      });
    }

    Message message = new MimeMessage(session);
    message.setFrom(new InternetAddress(fromEmail));
    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
    message.setSubject(msgSubject);
    message.setText(msgText);

    Transport.send(message);
  }
}
