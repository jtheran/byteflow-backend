

export interface IPayloadJWT {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  }
  
  declare global {
    namespace Express {
      interface Request {
        user?: IPayloadJWT;
      }
    }
  }