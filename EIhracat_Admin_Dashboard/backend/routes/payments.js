import { Router } from "express";
import { getPool, sql } from "../db.js";
import { asyncHandler, generateCode } from "../utils.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 200), 500);
  const pool = await getPool();
  const result = await pool.request().input("limit", sql.Int, limit).query(`
    SELECT TOP (@limit) o.OdemeID, s.SiparisNo, oy.YontemAdi, od.DurumAdi, o.OdemeTutari, o.OdemeTarihi, o.IslemNo
    FROM dbo.Odeme o
    JOIN dbo.Siparis s ON s.SiparisID = o.SiparisID
    JOIN dbo.OdemeYontemi oy ON oy.OdemeYontemiID = o.OdemeYontemiID
    JOIN dbo.OdemeDurum od ON od.OdemeDurumID = o.OdemeDurumID
    ORDER BY o.OdemeID DESC
  `);
  res.json(result.recordset);
}));

router.post("/", asyncHandler(async (req, res) => {
  const { siparisId, odemeYontemiId, odemeDurumId, odemeTutari } = req.body;
  const pool = await getPool();
  const islemNo = generateCode("PAY").slice(0, 30);
  const inserted = await pool.request()
    .input("SiparisID", sql.Int, siparisId)
    .input("OdemeYontemiID", sql.Int, odemeYontemiId)
    .input("OdemeDurumID", sql.Int, odemeDurumId)
    .input("OdemeTutari", sql.Decimal(18, 2), odemeTutari)
    .input("IslemNo", sql.NVarChar(30), islemNo)
    .query(`
      INSERT INTO dbo.Odeme (SiparisID, OdemeYontemiID, OdemeDurumID, OdemeTarihi, OdemeTutari, IslemNo)
      OUTPUT inserted.OdemeID, inserted.IslemNo
      VALUES (@SiparisID, @OdemeYontemiID, @OdemeDurumID, SYSDATETIME(), @OdemeTutari, @IslemNo)
    `);
  res.status(201).json(inserted.recordset[0]);
}));

export default router;
