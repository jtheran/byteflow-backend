import { prisma } from '../config/db.config';

export const createProduct = async (data: any, userId: string, userEmail: string) => {
  const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existing) throw new Error('El SKU o código de barras ya se encuentra registrado.');

  return await prisma.$transaction(async (tx :any) => {
    const product = await tx.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        minStock: data.minStock,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
      }
    });

    if (data.stock > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: data.stock,
          type: 'COMPRA',
          reason: 'Carga inicial de inventario al crear producto.',
          userId,
          userEmail
        }
      });
    }

    return product;
  });
};

export const getAllProducts = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;
  
  const where = {
    isActive: true,
    OR: search ? [
      { name: { contains: search, mode: 'insensitive' as const } },
      { sku: { contains: search, mode: 'insensitive' as const } }
    ] : undefined
  };

  const [total, data] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return { total, page, limit, totalPages: Math.ceil(total / limit), data };
};

export const getProductBySkuOrId = async (identifier: string) => {
  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ id: identifier }, { sku: identifier }]
    },
    include: { category: true, supplier: true }
  });
  
  if (!product) throw new Error('Producto no encontrado o inactivo.');
  return product;
};

export const updateProduct = async (id: string, data: any) => {
    // Si intentan actualizar el SKU, verificamos que no colisione con otro producto
    if (data.sku) {
      const existing = await prisma.product.findFirst({
        where: { sku: data.sku, NOT: { id } }
      });
      if (existing) throw new Error('El nuevo SKU o código de barras ya está asignado a otro producto.');
    }
  
    return await prisma.product.update({
      where: { id },
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
        cost: data.cost,
        minStock: data.minStock,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
      }
    });
  };
  
  export const changeProductStatus = async (id: string, isActive: boolean) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error('Producto no encontrado.');
  
    return await prisma.product.update({
      where: { id },
      data: { isActive }
    });
  };