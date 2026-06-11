import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { TestEmailSchema } from '../../schemas/test/mail.schema.spec';
import { TestWhatsappSchema, sendMediaSchema } from '../../schemas/test/wsp.schema.spec';
import { handleTestEmail } from '../../controllers/test/mail.controller.spec';
import { handleTestPushNotification } from '../../controllers/test/notification.controller.spec';
import { handleTestWhatsappQR, handleTestWhatsappSend, handleTestWhatsappMedia } from '../../controllers/test/wsp.controller.spec';


const router = Router();
//Rutas de Test

//Mail
router.post('/mail/send', validateRequest(TestEmailSchema), handleTestEmail);

//Notify Push
router.post('/notify/push', handleTestPushNotification);

//WSP
router.get('/wsp/qr', handleTestWhatsappQR);
router.post('/wsp/send/text/', validateRequest(TestWhatsappSchema), handleTestWhatsappSend)
router.post('/wsp/send/media/', validateRequest(sendMediaSchema), handleTestWhatsappMedia);

export default router;