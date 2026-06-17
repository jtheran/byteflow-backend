import { Router } from 'express';
import { isAuth } from '../middlewares/auth.middleware';
import produtRoutes from './product.route';
import clientRoutes from './client.route';
import saleRoutes from './sale.route';
import purchaseRoutes from './purchase.route';
import supplierRoutes from './supplier.route';
import categoryRoutes from './category.route';

const rootInit = Router();

rootInit.use('/product', produtRoutes);
rootInit.use('/client', clientRoutes);
rootInit.use('/sale', saleRoutes);
rootInit.use('/purchase', purchaseRoutes);
rootInit.use('/supplier', supplierRoutes);
rootInit.use('/category', categoryRoutes);

export default rootInit;
