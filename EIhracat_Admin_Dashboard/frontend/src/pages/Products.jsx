import { useEffect, useState } from "react";
import { apiGet } from "../api";
import GlassCard from "../components/GlassCard";
import TableView from "../components/TableView";

export default function Products() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    apiGet("/products?limit=300").then(setRows).catch(console.error);
  }, []);

  return (
    <div className="page-grid">
      <GlassCard title="Ürünler" subtitle="Stok, fiyat ve kategori bilgileri">
        <TableView rows={rows} />
      </GlassCard>
    </div>
  );
}
