// src/config/databaseInit.ts
import prisma from '../config/db.config';
import * as bcrypt from 'bcryptjs';

export async function initializeDatabase() {
  try {
    console.log('🔍 Verificando integridad de la base de datos (Roles y Permisos)...');

    // 1. Definición de todos los permisos avanzados por módulos
    const permissionsData = [
      // Módulo: Usuarios & Seguridad
      { slug: 'users:create', description: 'Crear nuevos empleados en el sistema' },
      { slug: 'users:read', description: 'Ver la lista de empleados y sus datos' },
      { slug: 'users:update', description: 'Modificar datos de empleados' },
      { slug: 'users:delete', description: 'Dar de baja o eliminar empleados' },
      { slug: 'roles:manage', description: 'Modificar la matriz de roles y permisos' },

      // Módulo: Ventas & Operaciones de Caja
      { slug: 'sales:create', description: 'Registrar nuevas ventas (Checkout)' },
      { slug: 'sales:read', description: 'Ver el historial de ventas del local' },
      { slug: 'sales:update', description: 'Modificar una venta no consolidada' },
      { slug: 'sales:void', description: 'Anular ventas realizadas (Requieres supervisión)' },
      { slug: 'sales:discount', description: 'Aplicar descuentos manuales en el checkout' },
      { slug: 'cash:open_close', description: 'Realizar apertura y cierre de caja diario (Arqueo)' },

      // Módulo: Productos & Stock
      { slug: 'products:create', description: 'Registrar nuevos productos en el catálogo' },
      { slug: 'products:read', description: 'Ver catálogo de productos, precios y existencias' },
      { slug: 'products:update', description: 'Editar información o precios de productos' },
      { slug: 'products:delete', description: 'Eliminar productos del catálogo' },
      { slug: 'stock:adjust', description: 'Realizar ajustes manuales de stock por auditoría o merma' },

      // Módulo: Proveedores & Compras (Abastecimiento)
      { slug: 'providers:manage', description: 'Crear, editar o eliminar proveedores' },
      { slug: 'purchases:create', description: 'Registrar facturas de compra para ingresar stock masivo' },

      // Módulo: Clientes (CRM)
      { slug: 'customers:manage', description: 'Gestionar base de datos de clientes y programas de puntos' },
      { slug: 'customers:view_own', description: 'Permite al cliente ver su propio historial y puntos acumulados' },

      // Módulo: Reportes & Auditoría (Business Intelligence)
      { slug: 'reports:financial', description: 'Ver reportes de ingresos, ganancias netas y flujos de efectivo' },
      { slug: 'reports:inventory', description: 'Ver reportes analíticos de rotación e inversión de inventario' },
      { slug: 'audit:logs', description: 'Acceder al log de auditoría del sistema (Monitoreo de acciones de usuarios)' },

      // Módulo: Configuración del Sistema
      { slug: 'system:settings', description: 'Modificar parámetros globales, impuestos y credenciales de APIs (WhatsApp/Email)' },
    ];

    // Sincronizar Permisos usando upsert (si existen los ignora/actualiza, si no los crea)
    const permissionsMap: Record<string, string> = {};
    for (const p of permissionsData) {
      const createdPerm = await prisma.permission.upsert({
        where: { slug: p.slug },
        update: { description: p.description },
        create: p,
      });
      permissionsMap[p.slug] = createdPerm.id;
    }

    // 2. Creación / Verificación de los Roles Solicitados
    const rolesToCreate = [
      { name: 'ADMIN', description: 'Administrador total y dueño del negocio con acceso irrestricto' },
      { name: 'CASHIER', description: 'Cajero u operador del punto de venta físico' },
      { name: 'SUPPLIER', description: 'Proveedor con acceso limitado para ver sus productos asignados o stock faltante' },
      { name: 'CLIENT', description: 'Cliente final con acceso al portal de facturas y puntos' },
      { name: 'SUPPORT', description: 'Soporte técnico externo (ByteForge) para mantenimiento y auditoría de logs sin ver datos financieros sensibles' },
    ];

    const rolesMap: Record<string, string> = {};
    for (const r of rolesToCreate) {
      const createdRole = await prisma.role.upsert({
        where: { name: r.name },
        update: { description: r.description },
        create: r,
      });
      rolesMap[r.name] = createdRole.id;
    }

    // 3. Asignación automática de relaciones de seguridad (RolePermissions)
    const assignPermissions = async (roleName: string, slugs: string[]) => {
      const roleId = rolesMap[roleName];
      for (const slug of slugs) {
        const permissionId = permissionsMap[slug];
        if (permissionId) {
          await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId, permissionId } },
            update: {},
            create: { roleId, permissionId },
          });
        }
      }
    };

    // Mapear permisos a cada rol (Solo creará lo que falte en base de datos)
    await assignPermissions('ADMIN', permissionsData.map(p => p.slug));
    await assignPermissions('CASHIER', ['sales:create', 'sales:read', 'sales:discount', 'cash:open_close', 'products:read', 'customers:manage']);
    await assignPermissions('SUPPLIER', ['products:read']);
    await assignPermissions('CLIENT', ['customers:view_own']);
    await assignPermissions('SUPPORT', ['users:read', 'roles:manage', 'products:read', 'audit:logs', 'system:settings']);

    // 4. Verificar si existe al menos el usuario Admin básico
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@byteflow.com' },
    });

    if (!adminExists) {
      console.log('👤 No se encontró el usuario administrador inicial. Creando...');
      const salt = await bcrypt.genSalt(10);
      const defaultPasswordHash = await bcrypt.hash('ByteFlow2026*', salt);

      await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: 'admin@byteflow.com',
          passwordHash: defaultPasswordHash,
          roleId: rolesMap['ADMIN'],
          dni: '1234567890',
        },
      });
      console.log('👤 Usuario admin@byteflow.com creado exitosamente.');
    }

    console.log('✅ Verificación de Base de Datos completada. Todo en orden.');
  } catch (error) {
    console.error('❌ Error crítico al inicializar los datos en el arranque:', error);
    // En producción podrías querer lanzar el error para tumbar el contenedor si la base de datos está corrupta
    throw error;
  }
}