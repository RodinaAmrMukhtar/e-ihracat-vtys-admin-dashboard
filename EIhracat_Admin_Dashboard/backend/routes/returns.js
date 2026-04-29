import { Router } from "express";
import { getPool } from "../db.js";
import { asyncHandler } from "../utils.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 200), 500);
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT TOP (${limit}) i.IadeID, s.SiparisNo, id.DurumAdi, n.NedenAdi, i.TalepTarihi, i.OnayTarihi
    FROM dbo.IadeTalep i
    JOIN dbo.Siparis s ON s.SiparisID = i.SiparisID
    JOIN dbo.IadeDurum id ON id.IadeDurumID = i.IadeDurumID
    LEFT JOIN dbo.IadeNeden n ON n.IadeNedenID = i.IadeNedenID
    ORDER BY i.IadeID DESC
  `);
  res.json(result.recordset);
}));

export default router;
