import { mailTransport } from '../config/mail.config';
import config from '../config/config';

interface ISendEmailArgs {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

// Diccionario de generadores de plantillas HTML funcionales
const emailTemplates: Record<string, (context: any) => string> = {
  'security-login-alert': (context) => `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #1e3a8a; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">🛡️ Alerta de Seguridad</h2>
      <p>Hola <strong>${context.name}</strong>,</p>
      <p>Se ha detectado un inicio de sesión exitoso en tu cuenta de ByteFlow POS.</p>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Fecha y Hora:</strong> ${context.date}</p>
        <p style="margin: 5px 0;"><strong>Dispositivo/Agente:</strong> ${context.userAgent}</p>
        <p style="margin: 5px 0;"><strong>Dirección IP:</strong> ${context.ipAddress}</p>
      </div>
      <p style="font-size: 13px; color: #6b7280;">Si fuiste tú, puedes ignorar este correo. De lo contrario, ponte en contacto inmediato con el administrador de sistemas de ByteForge.</p>
    </div>
  `,
  
  'otp-verification': (context) => `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">🔑 Código de Verificación OTP</h2>
      <p>Utiliza el siguiente código de seguridad de un solo uso para completar tu solicitud de acceso en la plataforma:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 5px; background-color: #eff6ff; color: #1d4ed8; padding: 10px 25px; border-radius: 6px; border: 1px dashed #bfdbfe;">
          ${context.otpToken}
        </span>
      </div>
      <p style="font-size: 13px; color: #6b7280;">Este código expirará en 5 minutos por motivos de seguridad. No compartas este código con nadie.</p>
    </div>
  `
};

export const sendMailService = async ({ to, subject, template, context }: ISendEmailArgs): Promise<void> => {
  const templateFn = emailTemplates[template];
  
  if (!templateFn) {
    throw new Error(`La plantilla de email [${template}] no está registrada en el sistema.`);
  }

  // Generamos el HTML plano inyectando las variables del contexto
  const htmlContent = templateFn(context);

  await mailTransport.sendMail({
    from: config.mail.EMAIL_FROM,
    to,
    subject,
    html: htmlContent,
  });
};