import iaClient from '../config/ia.config';
import qdrantClient from '../config/qdrant.config';
import config from '../config/config';
import { prisma } from '../config/db.config';
import crypto from 'cryptojs';

// Helper para generar embeddings usando OpenRouter
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await iaClient.embeddings.create({
    model: config.ia.MODEL_EMBEDDING,
    input: text,
  });

  return response.data[0].embedding;
}

export const syncDatabaseToQdrant = async () => {
  // 1. Asegurar que la colección existe en Qdrant
  const collections = await qdrantClient.getCollections();
  const exists = collections.collections.some(c => c.name === config.qdrant.COLLECTION_NAME);
  
  if (!exists) {
    await qdrantClient.createCollection(config.qdrant.COLLECTION_NAME, {
      vectors: { size: config.qdrant.SIZE, distance: 'Cosine' }
    });
  }

  // Acumulador global de puntos vectoriales para insertar en Qdrant
  const allPoints: any[] = [];
  const nowISO = new Date().toISOString();

  // ==========================================
  // 📦 1. INDEXAR PRODUCTOS E INVENTARIO
  // ==========================================
  const products = await prisma.product.findMany({ 
    where: { isActive: true }, 
    include: { category: { select: { name: true } } } 
  });
  
  for (const prod of products) {
    const text = `Producto: ${prod.name}. SKU/Código: ${prod.sku}. Categoría: ${prod.category?.name || 'General'}. Stock Actual: ${prod.stock} unidades. Precio de Venta: $${prod.price}.`;
    const vector = await generateEmbedding(text);
    const id = crypto.MD5(`prod_${prod.id}`).toString();
    
    allPoints.push({
      id, vector,
      payload: { source: 'products', originalId: prod.id, content: text, updatedAt: nowISO }
    });
  }

  // ==========================================
  // 💰 2. INDEXAR VENTAS (Sales)
  // ==========================================
  const sales = await prisma.sale.findMany({
    take: 500, // Limita según tus necesidades para no saturar tokens en la carga inicial
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { name: true } } }
  });

  for (const sale of sales) {
    const text = `Venta Realizada. Factura: ${sale.invoiceNumber}. Cliente: ${sale.client?.name || 'Consumidor Final'}. Total Facturado: $${sale.total}. Método de Pago: ${sale.paymentMethod}. Fecha de la transacción: ${sale.createdAt.toLocaleDateString()}.`;
    const vector = await generateEmbedding(text);
    const id = crypto.MD5(`sale_${sale.id}`).toString();

    allPoints.push({
      id, vector,
      payload: { source: 'sales', originalId: sale.id, content: text, updatedAt: nowISO }
    });
  }

  // ==========================================
  // 👥 3. INDEXAR CLIENTES (Clients)
  // ==========================================
  const clients = await prisma.client.findMany({ where: { isActive: true } });

  for (const client of clients) {
    const text = `Cliente Registrado: ${client.name}. Documento/NIT: ${client.document}. Correo: ${client.email}. Teléfono: ${client.phone}.`;
    const vector = await generateEmbedding(text);
    const id = crypto.MD5(`client_${client.id}`).toString();

    allPoints.push({
      id, vector,
      payload: { source: 'clients', originalId: client.id, content: text, updatedAt: nowISO }
    });
  }

  // ==========================================
  // 🚛 4. INDEXAR PROVEEDORES (Suppliers)
  // ==========================================
  const suppliers = await prisma.supplier.findMany({ where: { isActive: true } });

  for (const sup of suppliers) {
    const text = `Proveedor de Inventario: ${sup.companyName}. NIT/Identificación: ${sup.nit}. Contacto principal: ${sup.phone}. Correo corporativo: ${sup.email}.`;
    const vector = await generateEmbedding(text);
    const id = crypto.MD5(`supplier_${sup.id}`).toString();

    allPoints.push({
      id, vector,
      payload: { source: 'suppliers', originalId: sup.id, content: text, updatedAt: nowISO }
    });
  }

  // ==========================================
  // 🛒 5. INDEXAR COMPRAS / REABASTECIMIENTO (Purchases)
  // ==========================================
  const purchases = await prisma.purchase.findMany({
    take: 300,
    orderBy: { createdAt: 'desc' },
    include: { supplier: { select: { companyName: true } } }
  });

  for (const pur of purchases) {
    const text = `Orden de Compra / Abastecimiento a Proveedor. Proveedor: ${pur.supplier?.companyName || 'Desconocido'}. Monto Total Invertido: $${pur.total}. Número de Referencia/Recibo: ${pur.orderNumber}. Fecha: ${pur.createdAt.toLocaleDateString()}.`;
    const vector = await generateEmbedding(text);
    const id = crypto.MD5(`purchase_${pur.id}`).toString();

    allPoints.push({
      id, vector,
      payload: { source: 'purchases', originalId: pur.id, content: text, updatedAt: nowISO }
    });
  }

  // ==========================================
  // 📉 6. INDEXAR MERMAS / PÉRDIDAS (Waste)
  // ==========================================
  const mermas = await prisma.stockMovement.findMany({
    take: 300,
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true } } }
  });

  for (const mer of mermas) {
    const text = `Merma / Pérdida registrada en Inventario. Producto afectado: ${mer.product?.name}. Cantidad mermada: ${mer.quantity} unidades. Motivo reportado: ${mer.reason || 'No especificado'}. Costo total de la pérdida: $${mer.quantity}. Fecha: ${mer.createdAt.toLocaleDateString()}.`;
    const vector = await generateEmbedding(text);
    const id = crypto.MD5(`merma_${mer.id}`).toString();

    allPoints.push({
      id, vector,
      payload: { source: 'mermas', originalId: mer.id, content: text, updatedAt: nowISO }
    });
  }

  // ==========================================
  // 🚀 7. UPSERT MASIVO A QDRANT
  // ==========================================
  if (allPoints.length > 0) {
    // Dividimos los puntos en bloques de 50 si la lista es gigantesca, para respetar los límites de red de Qdrant
    const chunkPils = (arr: any[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
    const pointChunks = chunkPils(allPoints, 50);

    for (const chunk of pointChunks) {
      await qdrantClient.upsert(config.qdrant.COLLECTION_NAME, {
        wait: true,
        points: chunk
      });
    }
  }

  return { success: true, indexedCount: allPoints.length };
};