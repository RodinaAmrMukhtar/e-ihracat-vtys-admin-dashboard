import { Router } from "express";
import { getPool, sql } from "../db.js";
import { asyncHandler, generateCode } from "../utils.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 200), 500);
  const pool = await getPool();
  const result = await pool.request().input("limit", sql.Int, limit).query(`
    SELECT TOP (@limit) g.GumrukID, s.SiparisNo, g.BeyanNo, gd.DurumAdi, g.VergiTutari, g.GumrukTarihi
    FROM dbo.GumrukIslem g
    JOIN dbo.Siparis s ON s.SiparisID = g.SiparisID
    JOIN dbo.GumrukDurum gd ON gd.GumrukDurumID = g.GumrukDurumID
    ORDER BY g.GumrukID DESC
  `);
  res.json(result.recordset);
}));

router.post("/", asyncHandler(async (req, res) => {
  const { siparisId, cikisUlkeId, varisUlkeId, gumrukDurumId, vergiTutari, aciklama } = req.body;
  const pool = await getPool();
  const beyanNo = generateCode("GB").slice(0, 40);
  const inserted = await pool.request()
    .input("SiparisID", sql.Int, siparisId)
    .input("BeyanNo", sql.NVarChar(40), beyanNo)
    .input("CikisUlkeID", sql.Int, cikisUlkeId)
    .input("VarisUlkeID", sql.Int, varisUlkeId)
    .input("GumrukDurumID", sql.Int, gumrukDurumId)
    .input("VergiTutari", sql.Decimal(18, 2), vergiTutari ?? 0)
    .input("Aciklama", sql.NVarChar(250), aciklama || null)
    .query(`
      INSERT INTO dbo.GumrukIslem (SiparisID, BeyanNo, CikisUlkeID, VarisUlkeID, GumrukDurumID, GumrukTarihi, VergiTutari, Aciklama)
      OUTPUT inserted.GumrukID, inserted.BeyanNo
      VALUES (@SiparisID, @BeyanNo, @CikisUlkeID, @VarisUlkeID, @GumrukDurumID, SYSDATETIME(), @VergiTutari, @Aciklama)
    `);
  res.status(201).json(inserted.recordset[0]);
}));

export default router;
