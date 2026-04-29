import { Router } from "express";
import { getPool, sql } from "../db.js";
import { asyncHandler } from "../utils.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 200), 500);
  const pool = await getPool();
  const result = await pool.request().input("limit", sql.Int, limit).query(`
    SELECT TOP (@limit) a.AdresID, u.UlkeAdi, a.Sehir, a.PostaKodu, a.AcikAdres
    FROM dbo.Adres a
    JOIN dbo.Ulke u ON u.UlkeID = a.UlkeID
    ORDER BY a.AdresID DESC
  `);
  res.json(result.recordset);
}));

router.post("/", asyncHandler(async (req, res) => {
  const { ulkeId, sehir, postaKodu, acikAdres } = req.body;
  if (!ulkeId || !sehir || !acikAdres) {
    const err = new Error("Ülke, şehir ve açık adres zorunludur.");
    err.status = 400;
    throw err;
  }
  const pool = await getPool();
  const inserted = await pool.request()
    .input("UlkeID", sql.Int, ulkeId)
    .input("Sehir", sql.NVarChar(100), sehir)
    .input("PostaKodu", sql.NVarChar(20), postaKodu || null)
    .input("AcikAdres", sql.NVarChar(250), acikAdres)
    .query(`
      INSERT INTO dbo.Adres (UlkeID, Sehir, PostaKodu, AcikAdres)
      OUTPUT inserted.AdresID, inserted.UlkeID, inserted.Sehir, inserted.PostaKodu, inserted.AcikAdres
      VALUES (@UlkeID, @Sehir, @PostaKodu, @AcikAdres)
    `);
  res.status(201).json(inserted.recordset[0]);
}));

export default router;
