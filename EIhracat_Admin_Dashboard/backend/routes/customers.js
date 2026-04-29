import { Router } from "express";
import { getPool, sql } from "../db.js";
import { asyncHandler } from "../utils.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 200), 500);
  const search = req.query.search || "";
  const pool = await getPool();
  const result = await pool.request()
    .input("limit", sql.Int, limit)
    .input("search", sql.NVarChar(150), `%${search}%`)
    .query(`
      SELECT TOP (@limit) MusteriID, Ad, Soyad, Email, Telefon, KayitTarihi
      FROM dbo.Musteri
      WHERE Ad LIKE @search OR Soyad LIKE @search OR Email LIKE @search
      ORDER BY MusteriID DESC
    `);
  res.json(result.recordset);
}));

router.post("/", asyncHandler(async (req, res) => {
  const { ad, soyad, email, telefon } = req.body;
  if (!ad || !soyad || !email || !telefon) {
    const err = new Error("Ad, soyad, email ve telefon zorunludur.");
    err.status = 400;
    throw err;
  }
  const pool = await getPool();
  const inserted = await pool.request()
    .input("Ad", sql.NVarChar(100), ad)
    .input("Soyad", sql.NVarChar(100), soyad)
    .input("Email", sql.NVarChar(150), email)
    .input("Telefon", sql.NVarChar(20), telefon)
    .query(`
      INSERT INTO dbo.Musteri (Ad, Soyad, Email, Telefon)
      OUTPUT inserted.MusteriID, inserted.Ad, inserted.Soyad, inserted.Email, inserted.Telefon, inserted.KayitTarihi
      VALUES (@Ad, @Soyad, @Email, @Telefon)
    `);
  res.status(201).json(inserted.recordset[0]);
}));

export default router;
