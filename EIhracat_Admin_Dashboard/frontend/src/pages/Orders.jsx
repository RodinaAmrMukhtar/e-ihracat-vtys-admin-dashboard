import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import GlassCard from "../components/GlassCard";
import TableView from "../components/TableView";
import FormMessage from "../components/FormMessage";

export default function Orders() {
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const [lookups, setLookups] = useState({ paraBirimleri: [], siparisDurumlari: [], ulkeler: [], iadeNedenleri: [] });
  const [customers, setCustomers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderForm, setOrderForm] = useState({ musteriId: "", teslimatAdresId: "", faturaAdresId: "", paraBirimiKod: "EUR", siparisDurumId: "1", siparisNotu: "" });
  const [itemForm, setItemForm] = useState({ siparisId: "", urunId: "", adet: 1 });
  const [opsForm, setOpsForm] = useState({ siparisNo: "", yeniDurumAdi: "Onaylandı", vergiTutari: 25.5, aciklama: "UI üzerinden güncellendi", iadeNedenAdi: "Hasarlı ürün" });
  const [message, setMessage] = useState({ error: "", success: "" });

  const load = () => apiGet("/orders/summary?limit=100").then(setRows).catch(err => setMessage({ error: err.message, success: "" }));

  useEffect(() => {
    load();
    Promise.all([
      apiGet("/lookups/all"),
      apiGet("/customers?limit=200"),
      apiGet("/addresses?limit=200"),
      apiGet("/products?limit=200")
    ]).then(([lk, c, a, p]) => {
      setLookups(lk);
      setCustomers(c);
      setAddresses(a);
      setProducts(p);
    }).catch(console.error);
  }, []);

  async function createOrder(e) {
    e.preventDefault();
    setMessage({ error: "", success: "" });
    try {
      const created = await apiPost("/orders", {
        ...orderForm,
        musteriId: Number(orderForm.musteriId),
        teslimatAdresId: Number(orderForm.teslimatAdresId),
        faturaAdresId: Number(orderForm.faturaAdresId),
        siparisDurumId: Number(orderForm.siparisDurumId)
      });
      setMessage({ success: `Sipariş oluşturuldu: ${created.SiparisNo}`, error: "" });
      setOpsForm(v => ({ ...v, siparisNo: created.SiparisNo }));
      setItemForm(v => ({ ...v, siparisId: created.SiparisID }));
      load();
    } catch (err) { setMessage({ error: err.message, success: "" }); }
  }

  async function addItem(e) {
    e.preventDefault();
    setMessage({ error: "", success: "" });
    try {
      await apiPost(`/orders/${itemForm.siparisId}/items`, { urunId: Number(itemForm.urunId), adet: Number(itemForm.adet) });
      setMessage({ success: "Sipariş kalemi eklendi.", error: "" });
      load();
    } catch (err) { setMessage({ error: err.message, success: "" }); }
  }

  async function updateCustoms(e) {
    e.preventDefault();
    try {
      await apiPost("/orders/customs-update", opsForm);
      setMessage({ success: "Gümrük durumu güncellendi.", error: "" });
      load();
    } catch (err) { setMessage({ error: err.message, success: "" }); }
  }

  async function createReturn(e) {
    e.preventDefault();
    try {
      await apiPost("/orders/return-request", { siparisNo: opsForm.siparisNo, iadeNedenAdi: opsForm.iadeNedenAdi, aciklama: opsForm.aciklama });
      setMessage({ success: "İade talebi oluşturuldu.", error: "" });
      load();
    } catch (err) { setMessage({ error: err.message, success: "" }); }
  }

  async function loadDetail(siparisNo) {
    const data = await apiGet(`/orders/${siparisNo}`);
    setDetail(data);
  }

  return (
    <div className="page-grid two-cols">
      <div className="stack">
        <GlassCard title="Sipariş Özeti" subtitle="Kayıtlar ve tekil sipariş detayı">
          <div className="clickable-list">
            {rows.slice(0, 12).map(r => (
              <button key={r.SiparisID} className="list-btn" onClick={() => loadDetail(r.SiparisNo)}>
                <span>{r.SiparisNo}</span>
                <span>{r.Musteri}</span>
                <span>{r.SiparisDurumu}</span>
              </button>
            ))}
          </div>
          {detail && (
            <div className="detail-box">
              <h3>{detail.header?.SiparisNo}</h3>
              <p>{detail.header?.Musteri} · {detail.header?.SiparisDurumu}</p>
              <TableView rows={detail.items} />
            </div>
          )}
        </GlassCard>

        <GlassCard title="İşlemler" subtitle="Gümrük güncelleme ve iade talebi">
          <form className="form-grid" onSubmit={updateCustoms}>
            <input placeholder="Sipariş No" value={opsForm.siparisNo} onChange={e => setOpsForm({ ...opsForm, siparisNo: e.target.value })} />
            <input placeholder="Yeni Gümrük Durumu" value={opsForm.yeniDurumAdi} onChange={e => setOpsForm({ ...opsForm, yeniDurumAdi: e.target.value })} />
            <input type="number" step="0.01" placeholder="Vergi Tutarı" value={opsForm.vergiTutari} onChange={e => setOpsForm({ ...opsForm, vergiTutari: Number(e.target.value) })} />
            <input placeholder="Açıklama" value={opsForm.aciklama} onChange={e => setOpsForm({ ...opsForm, aciklama: e.target.value })} />
            <button className="primary-btn" type="submit">Gümrük Güncelle</button>
          </form>
          <form className="form-grid compact-top" onSubmit={createReturn}>
            <input placeholder="İade Nedeni" value={opsForm.iadeNedenAdi} onChange={e => setOpsForm({ ...opsForm, iadeNedenAdi: e.target.value })} />
            <button className="secondary-btn" type="submit">İade Talebi Oluştur</button>
          </form>
        </GlassCard>
      </div>

      <div className="stack">
        <GlassCard title="Yeni Sipariş" subtitle="Kullanım Senaryosu 4">
          <form className="form-grid" onSubmit={createOrder}>
            <select value={orderForm.musteriId} onChange={e => setOrderForm({ ...orderForm, musteriId: e.target.value })}>
              <option value="">Müşteri seçin</option>
              {customers.map(c => <option key={c.MusteriID} value={c.MusteriID}>{c.MusteriID} - {c.Ad} {c.Soyad}</option>)}
            </select>
            <select value={orderForm.teslimatAdresId} onChange={e => setOrderForm({ ...orderForm, teslimatAdresId: e.target.value })}>
              <option value="">Teslimat adresi</option>
              {addresses.map(a => <option key={a.AdresID} value={a.AdresID}>{a.AdresID} - {a.UlkeAdi}, {a.Sehir}</option>)}
            </select>
            <select value={orderForm.faturaAdresId} onChange={e => setOrderForm({ ...orderForm, faturaAdresId: e.target.value })}>
              <option value="">Fatura adresi</option>
              {addresses.map(a => <option key={a.AdresID} value={a.AdresID}>{a.AdresID} - {a.UlkeAdi}, {a.Sehir}</option>)}
            </select>
            <select value={orderForm.paraBirimiKod} onChange={e => setOrderForm({ ...orderForm, paraBirimiKod: e.target.value })}>
              {lookups.paraBirimleri?.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={orderForm.siparisDurumId} onChange={e => setOrderForm({ ...orderForm, siparisDurumId: e.target.value })}>
              {lookups.siparisDurumlari?.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <textarea placeholder="Sipariş Notu" value={orderForm.siparisNotu} onChange={e => setOrderForm({ ...orderForm, siparisNotu: e.target.value })} />
            <button className="primary-btn" type="submit">Sipariş Oluştur</button>
          </form>
        </GlassCard>

        <GlassCard title="Sipariş Kalemi Ekle" subtitle="Kullanım Senaryosu 5">
          <form className="form-grid" onSubmit={addItem}>
            <input placeholder="Sipariş ID" value={itemForm.siparisId} onChange={e => setItemForm({ ...itemForm, siparisId: e.target.value })} />
            <select value={itemForm.urunId} onChange={e => setItemForm({ ...itemForm, urunId: e.target.value })}>
              <option value="">Ürün seçin</option>
              {products.map(p => <option key={p.UrunID} value={p.UrunID}>{p.UrunAdi}</option>)}
            </select>
            <input type="number" min="1" placeholder="Adet" value={itemForm.adet} onChange={e => setItemForm({ ...itemForm, adet: e.target.value })} />
            <button className="secondary-btn" type="submit">Kalem Ekle</button>
          </form>
          <FormMessage error={message.error} success={message.success} />
        </GlassCard>
      </div>
    </div>
  );
}
