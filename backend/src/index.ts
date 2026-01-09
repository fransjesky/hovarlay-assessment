import express from "express";
import routes from "./routes/index.js";

const app = express();

app.use("/api", routes);

app.listen(3001, () => console.log("listening on port 3001"));
