import { Router } from 'express';
import { isAuth, checkPermission } from '../middlewares/auth.middleware';
import produtRoutes from './product.route';
import clientRoutes from './client.route';
import saleRoutes from './sale.route';
import purchaseRoutes from './purchase.route';

const rootInit = Router();

rootInit.use('/product', produtRoutes);
rootInit.use('/client', clientRoutes);
rootInit.use('/sale', saleRoutes);
rootInit.use('/purchase', purchaseRoutes);

export default rootInit;
