import express from "express";

import "./config/loadenv.js";
import helmet from "helmet";
import healthRoutes from "./routes/v1/health.route.js"
import loggerMiddleware from "./middlewares/logger.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import global404Handler from "./middlewares/global404Handler.js";
import cors from "cors";
import corsOptions from "./config/cors.config.js";
import env from "./config/env.js"



const app=express();
const PORT = env.PORT ;

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.use(loggerMiddleware);



app.get("/",(req,res)=>{
    res.json(
        {
            message:"hello world"
        }

    );
})

app.use("/api/v1/health",healthRoutes);


app.use(global404Handler);
app.use(errorMiddleware);

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
    
})