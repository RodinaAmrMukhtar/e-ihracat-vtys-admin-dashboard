import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./db.js";
import lookupsRouter from "./routes/lookups.js";
import customersRouter from "./routes/customers.js";
import addressesRouter from "./routes/addresses.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import paymentsRouter from "./routes/payments.js";
import shippingRouter from "./routes/shipping.js";
import customsRouter from "./routes/customs.js";
import returnsRouter from "./routes/returns.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: process.env.DB_DATABASE || "EIhracat_3NF",
    server: process.env.DB_SERVER || "(localdb)\\mssqllocaldb"
  });
});

app.get("/api/health/db", async (_req, res, next) => {
  try {
    const info = await testConnection();
    res.json({ status: "ok", ...info });
  } catch (error) {
    next(error);
  }
});

app.use("/api/lookups", lookupsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/shipping", shippingRouter);
app.use("/api/customs", customsRouter);
app.use("/api/returns", returnsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Sunucu hatası",
    detail: err.originalError?.info?.message || undefined
  });
});

const port = process.env.PORT || 4000;
app.listen(port, async () => {
  console.log(`API running on http://localhost:${port}`);
  try {
    const info = await testConnection();
    console.log(`SQL connected -> server: ${info.ServerName}, database: ${info.DatabaseName}, user: ${info.ConnectedUser}`);
  } catch (error) {
    console.error("SQL startup test failed:", error.message);
  }
});
