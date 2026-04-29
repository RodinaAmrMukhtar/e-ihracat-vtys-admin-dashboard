import { Router } from "express";
import { getPool, sql } from "../db.js";
import { asyncHandler, generateCode } from "../utils.js";

const router = Router();

router.get("/summary", asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 200), 500);
  const search = req.query.search || "";
  const pool = await getPool();
  const result = await pool.request()
    .input("limit", sql.Int, limit)
    .input("search", sql.NVarChar(50), `%${search}%`)
    .query(`
      SELECT TOP (@limit) *
      FROM dbo.vw_SiparisTamOzet
      WHERE SiparisNo LIKE @search OR Musteri LIKE @search OR Email LIKE @search
      ORDER BY SiparisID DESC
    `);
  res.json(result.recordset);
}));

router.get("/:siparisNo", asyncHandler(async (req, res) => {
  const pool = await getPool();
  const { siparisNo } = req.params;

  const header = await pool.request()
    .input("SiparisNo", sql.NVarChar(20), siparisNo)
    .query(`SELECT * FROM dbo.vw_SiparisTamOzet WHERE SiparisNo = @SiparisNo`);

  const items = await pool.request()
    .input("SiparisNo", sql.NVarChar(20), siparisNo)
    .query(`
      SELECT sd.SiparisDetayID, sd.SiparisSatirNo, u.UrunAdi, sd.BirimFiyat, sd.Adet, sd.SatirToplam
      FROM dbo.Siparis s
      JOIN dbo.SiparisDetay sd ON sd.SiparisID = s.SiparisID
      JOIN dbo.Urun u ON u.UrunID = sd.UrunID
      WHERE s.SiparisNo = @SiparisNo
      ORDER BY sd.SiparisSatirNo
    `);

  res.json({ header: header.recordset[0] || null, items: items.recordset });
}));

router.post("/", asyncHandler(async (req, res) => {
  const { musteriId, teslimatAdresId, faturaAdresId, paraBirimiKod, siparisDurumId, siparisNotu } = req.body;
  const pool = await getPool();
  const siparisNo = generateCode("SP").slice(0, 20);
  const durumId = siparisDurumId || 1;

  const inserted = await pool.request()
    .input("SiparisNo", sql.NVarChar(20), siparisNo)
    .input("MusteriID", sql.Int, musteriId)
    .input("TeslimatAdresID", sql.Int, teslimatAdresId)
    .input("FaturaAdresID", sql.Int, faturaAdresId)
    .input("ParaBirimiKod", sql.Char(3), paraBirimiKod)
    .input("SiparisDurumID", sql.Int, durumId)
    .input("SiparisNotu", sql.NVarChar(250), siparisNotu || null)
    .query(`
      INSERT INTO dbo.Siparis
      (SiparisNo, MusteriID, TeslimatAdresID, FaturaAdresID, ParaBirimiKod, SiparisDurumID, SiparisTarihi, SiparisNotu)
      OUTPUT inserted.SiparisID, inserted.SiparisNo
      VALUES (@SiparisNo, @MusteriID, @TeslimatAdresID, @FaturaAdresID, @ParaBirimiKod, @SiparisDurumID, SYSDATETIME(), @SiparisNotu)
    `);

  res.status(201).json(inserted.recordset[0]);
}));

router.post("/:siparisId/items", asyncHandler(async (req, res) => {
  const { siparisId } = req.params;
  const { urunId, adet, birimFiyat } = req.body;
  const pool = await getPool();

  const nextLine = await pool.request()
    .input("SiparisID", sql.Int, Number(siparisId))
    .query(`SELECT ISNULL(MAX(SiparisSatirNo), 0) + 1 AS NextLine FROM dbo.SiparisDetay WHERE SiparisID = @SiparisID`);

  const productPrice = await pool.request()
    .input("UrunID", sql.Int, urunId)
    .query(`SELECT BirimFiyat FROM dbo.Urun WHERE UrunID = @UrunID`);

  if (!productPrice.recordset[0]) {
    const err = new Error("Ürün bulunamadı.");
    err.status = 404;
    throw err;
  }

  const finalPrice = birimFiyat ?? productPrice.recordset[0].BirimFiyat;

  const inserted = await pool.request()
    .input("SiparisID", sql.Int, Number(siparisId))
    .input("SiparisSatirNo", sql.TinyInt, nextLine.recordset[0].NextLine)
    .input("UrunID", sql.Int, urunId)
    .input("BirimFiyat", sql.Decimal(18, 2), finalPrice)
    .input("Adet", sql.Int, adet)
    .query(`
      INSERT INTO dbo.SiparisDetay (SiparisID, SiparisSatirNo, UrunID, BirimFiyat, Adet)
      OUTPUT inserted.SiparisDetayID, inserted.SiparisID, inserted.SiparisSatirNo
      VALUES (@SiparisID, @SiparisSatirNo, @UrunID, @BirimFiyat, @Adet)
    `);

  res.status(201).json(inserted.recordset[0]);
}));

router.post("/customs-update", asyncHandler(async (req, res) => {
  const { siparisNo, yeniDurumAdi, vergiTutari, aciklama } = req.body;
  const pool = await getPool();
  await pool.request()
    .input("SiparisNo", sql.NVarChar(20), siparisNo)
    .input("YeniDurumAdi", sql.NVarChar(50), yeniDurumAdi)
    .input("VergiTutari", sql.Decimal(18, 2), vergiTutari ?? null)
    .input("Aciklama", sql.NVarChar(250), aciklama || null)
    .execute("dbo.sp_GumrukDurumGuncelle");
  res.json({ message: "Gümrük durumu güncellendi" });
}));

router.post("/return-request", asyncHandler(async (req, res) => {
  const { siparisNo, iadeNedenAdi, aciklama } = req.body;
  const pool = await getPool();
  await pool.request()
    .input("SiparisNo", sql.NVarChar(20), siparisNo)
    .input("IadeNedenAdi", sql.NVarChar(100), iadeNedenAdi)
    .input("Aciklama", sql.NVarChar(250), aciklama || null)
    .execute("dbo.sp_IadeTalebiOlustur");
  res.json({ message: "İade talebi oluşturuldu" });
}));

export default router;
