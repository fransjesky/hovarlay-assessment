import express from "express";
import routes from "./routes/index.js";
import dotenv from "dotenv";

const app = express();

dotenv.config();

app.use("/api", routes);

app.listen(process.env.PORT, () => console.log(`server is up and listening on http://localhost:${process.env.PORT}`));
