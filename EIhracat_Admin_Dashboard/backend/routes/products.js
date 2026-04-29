import { Router } from "express";
import { getPool, sql } from "../db.js";
import { asyncHandler } from "../utils.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 300), 800);
  const search = req.query.search || "";
  const pool = await getPool();
  const result = await pool.request()
    .input("limit", sql.Int, limit)
    .input("search", sql.NVarChar(150), `%${search}%`)
    .query(`
      SELECT TOP (@limit) u.UrunID, u.UrunAdi, u.BirimFiyat, u.StokAdedi, u.AktifMi, k.KategoriAdi
      FROM dbo.Urun u
      JOIN dbo.Kategori k ON k.KategoriID = u.KategoriID
      WHERE u.UrunAdi LIKE @search OR k.KategoriAdi LIKE @search
      ORDER BY u.UrunID DESC
    `);
  res.json(result.recordset);
}));

export default router;
