import env from "./env.js";
const corsOptions = {
  origin: env.VITE_API_URL,
  credentials: true
};

export default corsOptions;