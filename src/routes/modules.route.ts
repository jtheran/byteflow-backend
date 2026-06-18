import { Router } from 'express';
import { isAuth } from '../middlewares/auth.middleware';
import produtRoutes from './product.route';
import clientRoutes from './client.route';
import saleRoutes from './sale.route';
import purchaseRoutes from './purchase.route';
import supplierRoutes from './supplier.route';
import categoryRoutes from './category.route';
import userRoutes from './user.route';
import sessionRoutes from './session.route';
import mermaRoutes from './merma.route';
import promotionRoutes from './promotion.route';
import aiRoutes from './ia.route';

const rootInit = Router();

rootInit.use('/product', produtRoutes);
rootInit.use('/client', clientRoutes);
rootInit.use('/sale', saleRoutes);
rootInit.use('/purchase', purchaseRoutes);
rootInit.use('/supplier', supplierRoutes);
rootInit.use('/category', categoryRoutes);
rootInit.use('/user', userRoutes);
rootInit.use('/session', sessionRoutes);
rootInit.use('/merma', mermaRoutes);
rootInit.use('/promotion', promotionRoutes);
rootInit.use('/ai', aiRoutes);

export default rootInit;
