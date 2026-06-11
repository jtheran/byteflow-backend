import nodemailer from 'nodemailer';
import config from './config';

export const mailTransport = nodemailer.createTransport({
  host: config.mail.SMTP_HOST ,
  port: parseInt(config.mail.SMTP_PORT),
  secure: config.mail.SMTP_PORT === '465',
  auth: config.mail.SMTP_USER ? {
    user: config.mail.SMTP_USER,
    pass: config.mail.SMTP_PASS,
  } : undefined, // En desarrollo local con herramientas como Mailpit no se necesita auth
});

// Verificar la conexión con el servidor de correos al arrancar
mailTransport.verify((error) => {
  if (error) {
    console.error('🚨 [Mailer]: Error de configuración en el proveedor de email:', error);
  } else {
    console.log('📧 [Mailer]: Servidor de correos listo para despachar.');
  }
});