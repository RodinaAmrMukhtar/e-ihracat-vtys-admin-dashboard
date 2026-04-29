import { Router } from "express";
import { getPool } from "../db.js";
import { asyncHandler } from "../utils.js";

const router = Router();

router.get("/all", asyncHandler(async (_req, res) => {
  const pool = await getPool();
  const queries = {
    paraBirimleri: "SELECT ParaBirimiKod AS value, ParaBirimiAdi AS label FROM dbo.ParaBirimi ORDER BY ParaBirimiKod",
    siparisDurumlari: "SELECT SiparisDurumID AS value, DurumAdi AS label FROM dbo.SiparisDurum ORDER BY SiparisDurumID",
    odemeYontemleri: "SELECT OdemeYontemiID AS value, YontemAdi AS label FROM dbo.OdemeYontemi ORDER BY OdemeYontemiID",
    odemeDurumlari: "SELECT OdemeDurumID AS value, DurumAdi AS label FROM dbo.OdemeDurum ORDER BY OdemeDurumID",
    kargoFirmalari: "SELECT KargoFirmasiID AS value, FirmaAdi AS label FROM dbo.KargoFirmasi ORDER BY KargoFirmasiID",
    kargoDurumlari: "SELECT KargoDurumID AS value, DurumAdi AS label FROM dbo.KargoDurum ORDER BY KargoDurumID",
    gumrukDurumlari: "SELECT GumrukDurumID AS value, DurumAdi AS label FROM dbo.GumrukDurum ORDER BY GumrukDurumID",
    iadeNedenleri: "SELECT IadeNedenID AS value, NedenAdi AS label FROM dbo.IadeNeden ORDER BY IadeNedenID",
    iadeDurumlari: "SELECT IadeDurumID AS value, DurumAdi AS label FROM dbo.IadeDurum ORDER BY IadeDurumID",
    ulkeler: "SELECT UlkeID AS value, UlkeAdi AS label FROM dbo.Ulke ORDER BY UlkeAdi",
    kategoriler: "SELECT KategoriID AS value, KategoriAdi AS label FROM dbo.Kategori ORDER BY KategoriAdi"
  };

  const result = {};
  for (const [key, query] of Object.entries(queries)) {
    const r = await pool.request().query(query);
    result[key] = r.recordset;
  }
  res.json(result);
}));

export default router;
