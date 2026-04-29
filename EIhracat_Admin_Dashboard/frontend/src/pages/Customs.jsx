import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import GlassCard from "../components/GlassCard";
import TableView from "../components/TableView";
import FormMessage from "../components/FormMessage";

export default function Customs() {
  const [rows, setRows] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lookups, setLookups] = useState({ gumrukDurumlari: [], ulkeler: [] });
  const [createForm, setCreateForm] = useState({ siparisId: "", cikisUlkeId: "", varisUlkeId: "", gumrukDurumId: "", vergiTutari: 0, aciklama: "" });
  const [updateForm, setUpdateForm] = useState({ siparisNo: "", yeniDurumAdi: "Onaylandı", vergiTutari: 0, aciklama: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => apiGet("/customs?limit=200").then(setRows).catch(err => setError(err.message));
  useEffect(() => {
    load();
    Promise.all([apiGet("/lookups/all"), apiGet("/orders/summary?limit=200")]).then(([lk, os]) => {
      setLookups(lk);
      setOrders(os);
    }).catch(console.error);
  }, []);

  async function createCustoms(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await apiPost("/customs", {
        siparisId: Number(createForm.siparisId),
        cikisUlkeId: Number(createForm.cikisUlkeId),
        varisUlkeId: Number(createForm.varisUlkeId),
        gumrukDurumId: Number(createForm.gumrukDurumId),
        vergiTutari: Number(createForm.vergiTutari),
        aciklama: createForm.aciklama
      });
      setSuccess("Gümrük kaydı oluşturuldu.");
      load();
    } catch (err) { setError(err.message); }
  }

  async function updateCustoms(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await apiPost("/orders/customs-update", updateForm);
      setSuccess("Gümrük durumu prosedür ile güncellendi.");
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="page-grid two-cols">
      <div className="stack">
        <GlassCard title="Gümrük Kayıtları" subtitle="Mevcut kayıtlar">
          <TableView rows={rows.slice(0, 50)} />
        </GlassCard>
      </div>
      <div className="stack">
        <GlassCard title="Yeni Gümrük Kaydı" subtitle="Kullanım Senaryosu 8 - oluşturma">
          <form className="form-grid" onSubmit={createCustoms}>
            <select value={createForm.siparisId} onChange={e => setCreateForm({ ...createForm, siparisId: e.target.value })}>
              <option value="">Sipariş seçin</option>
              {orders.map(o => <option key={o.SiparisID} value={o.SiparisID}>{o.SiparisNo}</option>)}
            </select>
            <select value={createForm.cikisUlkeId} onChange={e => setCreateForm({ ...createForm, cikisUlkeId: e.target.value })}>
              <option value="">Çıkış ülkesi</option>
              {lookups.ulkeler?.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
            <select value={createForm.varisUlkeId} onChange={e => setCreateForm({ ...createForm, varisUlkeId: e.target.value })}>
              <option value="">Varış ülkesi</option>
              {lookups.ulkeler?.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
            <select value={createForm.gumrukDurumId} onChange={e => setCreateForm({ ...createForm, gumrukDurumId: e.target.value })}>
              <option value="">Gümrük durumu</option>
              {lookups.gumrukDurumlari?.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
            <input type="number" step="0.01" value={createForm.vergiTutari} onChange={e => setCreateForm({ ...createForm, vergiTutari: e.target.value })} placeholder="Vergi tutarı" />
            <textarea placeholder="Açıklama" value={createForm.aciklama} onChange={e => setCreateForm({ ...createForm, aciklama: e.target.value })} />
            <button className="primary-btn" type="submit">Gümrük Kaydı Oluştur</button>
          </form>
        </GlassCard>

        <GlassCard title="Durum Güncelle" subtitle="sp_GumrukDurumGuncelle ile">
          <form className="form-grid" onSubmit={updateCustoms}>
            <input placeholder="Sipariş No" value={updateForm.siparisNo} onChange={e => setUpdateForm({ ...updateForm, siparisNo: e.target.value })} />
            <input placeholder="Yeni Durum Adı" value={updateForm.yeniDurumAdi} onChange={e => setUpdateForm({ ...updateForm, yeniDurumAdi: e.target.value })} />
            <input type="number" step="0.01" placeholder="Vergi Tutarı" value={updateForm.vergiTutari} onChange={e => setUpdateForm({ ...updateForm, vergiTutari: Number(e.target.value) })} />
            <textarea placeholder="Açıklama" value={updateForm.aciklama} onChange={e => setUpdateForm({ ...updateForm, aciklama: e.target.value })} />
            <button className="secondary-btn" type="submit">Durumu Güncelle</button>
          </form>
        </GlassCard>
        <FormMessage error={error} success={success} />
      </div>
    </div>
  );
}
