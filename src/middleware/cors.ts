import { cors as corsMiddy, ICorsOptions } from 'middy/middlewares';

const corsOptions: ICorsOptions = {
  origin: 'http://localhost:8080'
};

export const cors = () => {
  return corsMiddy(corsOptions);
};
