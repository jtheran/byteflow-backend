import { prisma } from '../config/db.config';
import config from '../config/config';
import { addEmailToQueue } from '../queues/email.queue'; // Ajusta la ruta según tu estructura
import { addWhatsappToQueue } from '../queues/wsp.queue'; // Ajusta la ruta según tu estructura

export const verifyAndAlertStock = async () => {
  // 1. Consultar productos activos
  const products = await prisma.product.findMany({ where: { isActive: true }, include: { category: { select: { name: true } } } });
  
  const lowStockThreshold = config.stock.MIN;   // Umbral de desabastecimiento
  const overStockThreshold = config.stock.MAX; // Umbral de sobre-stock

  const lowStockList: string[] = [];
  const overStockList: string[] = [];

  // Formateamos las listas de productos que violan las reglas
  for (const prod of products) {
    if (prod.stock <= lowStockThreshold) {
      lowStockList.push(`• ${prod.name} (SKU: ${prod.sku}) - Stock Actual: ${prod.stock} uds (Mínimo: ${lowStockThreshold})`);
    } else if (prod.stock >= overStockThreshold) {
      overStockList.push(`• ${prod.name} (SKU: ${prod.sku}) - Stock Actual: ${prod.stock} uds (Máximo: ${overStockThreshold})`);
    }
  }

  // 2. Si hay anomalías, las mandamos a las colas correspondientes
  if (lowStockList.length > 0 || overStockList.length > 0) {
    const adminPhone = '573000000000'; // Tu número de WhatsApp configurado
    const adminEmail = 'admin@byteforge.com';

    // --- CONSTRUCCIÓN DEL CONTENIDO ---
    let whatsappText = `⚠️ *REPORTES DE INVENTARIO CRÍTICO (ByteFlow POS)*\n\n`;
    let emailHtmlContent = ``;

    if (lowStockList.length > 0) {
      whatsappText += `🚨 *ALERTA: STOCK CRÍTICO / CASI VACÍO*\n${lowStockList.join('\n')}\n\n`;
      emailHtmlContent += `
        <h3 style="color: #E65100;">🚨 Alerta: Stock Crítico / Casi Vacío</h3>
        <ul>${lowStockList.map(item => `<li>${item}</li>`).join('')}</ul>
      `;
    }

    if (overStockList.length > 0) {
      whatsappText += `📦 *ALERTA: SOBRE-STOCK / EXCESO*\n${overStockList.join('\n')}\n`;
      emailHtmlContent += `
        <h3 style="color: #00A3FF;">📦 Alerta: Sobre-Stock / Exceso</h3>
        <ul>${overStockList.map(item => `<li>${item}</li>`).join('')}</ul>
      `;
    }

    // --- ENCOLA MIENTO ASÍNCRONO ---

    // 1. Despachar a la cola de WhatsApp usando la firma de texto plano que creaste
    await addWhatsappToQueue(adminPhone, whatsappText);

    // 2. Despachar a la cola de Correos respetando la interfaz IEmailJobData
    await addEmailToQueue({
      to: adminEmail,
      subject: '🚨 Alerta Crítica de Inventario - ByteFlow POS',
      template: 'stock-alert', // El nombre de tu plantilla hbs o html que use tu Worker
      context: {
        title: 'Reporte de Alertas de Inventario',
        date: new Date().toLocaleString(),
        htmlContent: emailHtmlContent // Inyectamos el bloque html dinámico
      }
    });
  }

  return { lowStockCount: lowStockList.length, overStockCount: overStockList.length };
};