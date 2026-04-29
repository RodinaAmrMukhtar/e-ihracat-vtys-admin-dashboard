import { Router } from "express";
import { getPool, sql } from "../db.js";
import { asyncHandler, generateCode } from "../utils.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 200), 500);
  const pool = await getPool();
  const result = await pool.request().input("limit", sql.Int, limit).query(`
    SELECT TOP (@limit) k.KargoID, s.SiparisNo, f.FirmaAdi, d.DurumAdi, k.TakipNo, k.CikisTarihi, k.TahminiTeslimTarihi, k.TeslimTarihi
    FROM dbo.Kargo k
    JOIN dbo.Siparis s ON s.SiparisID = k.SiparisID
    JOIN dbo.KargoFirmasi f ON f.KargoFirmasiID = k.KargoFirmasiID
    JOIN dbo.KargoDurum d ON d.KargoDurumID = k.KargoDurumID
    ORDER BY k.KargoID DESC
  `);
  res.json(result.recordset);
}));

router.post("/", asyncHandler(async (req, res) => {
  const { siparisId, kargoFirmasiId, kargoDurumId, cikisTarihi, tahminiTeslimTarihi, teslimTarihi } = req.body;
  const pool = await getPool();
  const takipNo = generateCode("TRK").slice(0, 40);
  const inserted = await pool.request()
    .input("SiparisID", sql.Int, siparisId)
    .input("KargoFirmasiID", sql.Int, kargoFirmasiId)
    .input("KargoDurumID", sql.Int, kargoDurumId)
    .input("TakipNo", sql.NVarChar(40), takipNo)
    .input("CikisTarihi", sql.DateTime2, cikisTarihi || new Date())
    .input("TahminiTeslimTarihi", sql.DateTime2, tahminiTeslimTarihi || null)
    .input("TeslimTarihi", sql.DateTime2, teslimTarihi || null)
    .query(`
      INSERT INTO dbo.Kargo (SiparisID, KargoFirmasiID, TakipNo, KargoDurumID, CikisTarihi, TahminiTeslimTarihi, TeslimTarihi)
      OUTPUT inserted.KargoID, inserted.TakipNo
      VALUES (@SiparisID, @KargoFirmasiID, @TakipNo, @KargoDurumID, @CikisTarihi, @TahminiTeslimTarihi, @TeslimTarihi)
    `);
  res.status(201).json(inserted.recordset[0]);
}));

export default router;
