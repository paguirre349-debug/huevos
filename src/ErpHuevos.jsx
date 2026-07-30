import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, Boxes, Egg, Users, Truck,
  Package, Wallet, FileBarChart, Target, Sparkles, Settings,
  Search, Plus, Bell, TrendingUp, TrendingDown, Command,
  ChevronRight, Trash2, Loader2, Pencil, Menu, X, Clock, Download, Target as TargetIcon, Lightbulb,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, CartesianGrid, BarChart, Bar,
} from "recharts";
import { supabase } from "./supabase";

const C = {
  bg: "#0B0F19", card: "#121826", border: "#1F2937",
  text: "#FFFFFF", sub: "#9CA3AF", amber: "#F59E0B",
  green: "#22C55E", red: "#EF4444", blue: "#3B82F6",
};

const money = (n) => "$" + Number(n || 0).toLocaleString("es-AR");
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: ShoppingCart, label: "Ventas", key: "ventas" },
  { icon: Boxes, label: "Stock", key: "stock" },
  { icon: Egg, label: "Productos", key: "productos" },
  { icon: Users, label: "Clientes", key: "clientes" },
  { icon: Truck, label: "Proveedores", key: "proveedores" },
  { icon: Package, label: "Compras", key: "compras" },
  { icon: Wallet, label: "Gastos", key: "gastos" },
  { icon: FileBarChart, label: "Reportes", key: "reportes" },
  { icon: Target, label: "Objetivos", key: "objetivos" },
  { icon: Sparkles, label: "IA", key: "ia" },
  { icon: Settings, label: "Configuración", key: "config" },
];

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  const node = (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl text-sm font-medium shadow-2xl"
          style={{ background: C.card, border: `1px solid ${toast.type === "ok" ? C.green : C.red}`, color: C.text }}>
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
  return { show, node };
}

function Card({ children, style, className = "", ...rest }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, ...style }}
      className={className} {...rest}>{children}</div>
  );
}

const ChartTip = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0B0F19", border: `1px solid ${C.border}`, borderRadius: 12 }}
      className="px-3 py-2 text-xs shadow-xl">
      <div style={{ color: C.sub }} className="mb-1">{label}</div>
      {payload.map((p, idx) => (
        <div key={idx} style={{ color: p.color || p.stroke || C.text }} className="font-semibold">
          {fmt ? fmt(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium mb-1.5 block" style={{ color: C.sub }}>{label}</label>
      {children}
    </div>
  );
}

function Productos({ toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: "", precio_venta: "", costo_actual: "", unidades_por_maple: 30 });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ precio_venta: "", costo_actual: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) toast(error.message, "err"); else setItems(data || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.nombre.trim()) return toast("Poné un nombre", "err");
    setSaving(true);
    const { error } = await supabase.from("products").insert({
      nombre: form.nombre.trim(),
      precio_venta: Number(form.precio_venta) || 0,
      costo_actual: Number(form.costo_actual) || 0,
      unidades_por_maple: Number(form.unidades_por_maple) || 30,
    });
    setSaving(false);
    if (error) return toast(error.message, "err");
    toast("Producto agregado");
    setForm({ nombre: "", precio_venta: "", costo_actual: "", unidades_por_maple: 30 });
    load();
  };

  const del = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast(error.message, "err");
    toast("Producto eliminado"); load();
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setEditForm({ precio_venta: p.precio_venta, costo_actual: p.costo_actual });
  };

  const saveEdit = async (id) => {
    const { error } = await supabase.from("products").update({
      precio_venta: Number(editForm.precio_venta) || 0,
      costo_actual: Number(editForm.costo_actual) || 0,
    }).eq("id", id);
    if (error) return toast(error.message, "err");
    toast("Precio actualizado");
    setEditId(null);
    load();
  };

  const inp = { background: C.bg, border: `1px solid ${C.border}`, color: C.text };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h3 className="font-semibold mb-4" style={{ color: C.text }}>Nuevo producto</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <input placeholder="Nombre (ej: Maple x30)" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
          <input placeholder="Precio venta" type="number" value={form.precio_venta}
            onChange={(e) => setForm({ ...form, precio_venta: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
          <input placeholder="Costo" type="number" value={form.costo_actual}
            onChange={(e) => setForm({ ...form, costo_actual: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
          <input placeholder="Unid. por maple" type="number" value={form.unidades_por_maple}
            onChange={(e) => setForm({ ...form, unidades_por_maple: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={add} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: C.amber, color: "#0B0F19" }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Agregar producto
        </motion.button>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-4" style={{ color: C.text }}>Tus productos</h3>
        {loading ? (
          <div className="flex items-center gap-2 py-8 justify-center" style={{ color: C.sub }}>
            <Loader2 size={18} className="animate-spin" /> Cargando…
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: C.sub }}>
            Todavía no cargaste productos. Agregá el primero arriba.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.bg }}>
                {editId === p.id ? (
                  <>
                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                      <span className="font-medium text-sm" style={{ color: C.text }}>{p.nombre}</span>
                      <span className="text-xs" style={{ color: C.sub }}>Venta</span>
                      <input type="number" value={editForm.precio_venta}
                        onChange={(e) => setEditForm({ ...editForm, precio_venta: e.target.value })}
                        className="w-24 px-2 py-1 rounded-lg text-sm outline-none" style={inp} />
                      <span className="text-xs" style={{ color: C.sub }}>Costo</span>
                      <input type="number" value={editForm.costo_actual}
                        onChange={(e) => setEditForm({ ...editForm, costo_actual: e.target.value })}
                        className="w-24 px-2 py-1 rounded-lg text-sm outline-none" style={inp} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => saveEdit(p.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: C.green, color: "#0B0F19" }}>Guardar</button>
                      <button onClick={() => setEditId(null)} className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ color: C.sub }}>Cancelar</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="font-medium text-sm" style={{ color: C.text }}>{p.nombre}</div>
                      <div className="text-xs" style={{ color: C.sub }}>
                        Venta {money(p.precio_venta)} · Costo {money(p.costo_actual)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: C.blue }}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => del(p.id)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: C.red }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function QuickSale({ open, onClose, toast, onSaved }) {
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: "", cantidad: 1, metodo_pago: "efectivo", observaciones: "", fecha: "" });

  // Devuelve la fecha/hora actual en formato para el input datetime-local
  const ahoraLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (!open) return;
    setForm((f) => ({ ...f, fecha: ahoraLocal() }));
    supabase.from("products").select("*").eq("activo", true).then(({ data }) => {
      setProducts(data || []);
      if (data?.[0]) setForm((f) => ({ ...f, product_id: f.product_id || data[0].id }));
    });
  }, [open]);

  const guardar = async () => {
    const prod = products.find((p) => p.id === form.product_id);
    if (!prod) return toast("Primero cargá un producto en Productos", "err");
    const cant = Number(form.cantidad) || 0;
    if (cant <= 0) return toast("La cantidad debe ser mayor a 0", "err");
    setSaving(true);
    const total = prod.precio_venta * cant;
    const ganancia = (prod.precio_venta - prod.costo_actual) * cant;
    const { data: sale, error: e1 } = await supabase.from("sales").insert({
      metodo_pago: form.metodo_pago, total, ganancia, observaciones: form.observaciones,
      fecha: form.fecha ? new Date(form.fecha).toISOString() : new Date().toISOString(),
    }).select().single();
    if (e1) { setSaving(false); return toast(e1.message, "err"); }
    const { error: e2 } = await supabase.from("sale_items").insert({
      sale_id: sale.id, product_id: prod.id, cantidad: cant,
      precio_unit: prod.precio_venta, costo_unit: prod.costo_actual, subtotal: total,
    });
    if (e2) { setSaving(false); return toast(e2.message, "err"); }
    await supabase.from("stock_movements").insert({
      product_id: prod.id, tipo: "salida", cantidad: cant, motivo: "venta",
    });
    setSaving(false);
    toast("Venta guardada ✓");
    setForm({ product_id: prod.id, cantidad: 1, metodo_pago: "efectivo", observaciones: "", fecha: ahoraLocal() });
    onSaved && onSaved();
    onClose();
  };

  const inp = { background: C.bg, border: `1px solid ${C.border}`, color: C.text };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed right-0 top-0 bottom-0 z-50 w-[420px] p-6 overflow-y-auto"
            style={{ background: C.card, borderLeft: `1px solid ${C.border}` }}
            initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: C.text }}>Nueva venta</h2>
              <button onClick={onClose} className="text-2xl leading-none" style={{ color: C.sub }}>×</button>
            </div>
            {products.length === 0 ? (
              <div className="p-4 rounded-xl text-sm" style={{ background: C.bg, color: C.sub }}>
                No tenés productos cargados. Andá a <b style={{ color: C.amber }}>Productos</b> y creá al menos uno para poder vender.
              </div>
            ) : (
              <>
                <Field label="Producto">
                  <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inp}>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.nombre} — {money(p.precio_venta)}</option>)}
                  </select>
                </Field>
                <Field label="Cantidad">
                  <input type="number" value={form.cantidad} min={1}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
                </Field>
                <Field label="Fecha y hora de la venta">
                  <input type="datetime-local" value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
                  <p className="text-[11px] mt-1" style={{ color: C.sub }}>Viene con la hora actual. Cambiala si cargás una venta de antes.</p>
                </Field>
                <Field label="Forma de pago">
                  <select value={form.metodo_pago} onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inp}>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                </Field>
                <Field label="Observaciones">
                  <textarea rows={2} value={form.observaciones} placeholder="Opcional"
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={inp} />
                </Field>
                <motion.button whileTap={{ scale: 0.97 }} onClick={guardar} disabled={saving}
                  className="w-full py-3 rounded-xl font-semibold text-sm mt-2 flex items-center justify-center gap-2"
                  style={{ background: C.amber, color: "#0B0F19" }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  Guardar venta
                </motion.button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Ventas({ toast, refreshKey }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    supabase.from("sales").select("*").order("fecha", { ascending: false }).limit(50)
      .then(({ data, error }) => {
        if (error) toast(error.message, "err"); else setSales(data || []);
        setLoading(false);
      });
  }, [toast, refreshKey]);
  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-4" style={{ color: C.text }}>Historial de ventas</h3>
      {loading ? (
        <div className="flex items-center gap-2 py-8 justify-center" style={{ color: C.sub }}>
          <Loader2 size={18} className="animate-spin" /> Cargando…
        </div>
      ) : sales.length === 0 ? (
        <div className="py-8 text-center text-sm" style={{ color: C.sub }}>
          Todavía no hay ventas. Apretá <b style={{ color: C.amber }}>+ Venta</b> arriba para cargar la primera.
        </div>
      ) : (
        <div className="space-y-2">
          {sales.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.bg }}>
              <div>
                <div className="font-medium text-sm" style={{ color: C.text }}>{money(s.total)}</div>
                <div className="text-xs capitalize" style={{ color: C.sub }}>
                  {s.metodo_pago} · {new Date(s.fecha).toLocaleString("es-AR")}
                </div>
              </div>
              <div className="text-xs font-semibold" style={{ color: C.green }}>+{money(s.ganancia)}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Stat({ icon: Icon, label, value, color, i }) {
  return (
    <motion.div custom={i} variants={fadeUp} initial="hidden" animate="show" whileHover={{ y: -3 }}>
      <Card className="p-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}1A` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div className="text-sm mb-1" style={{ color: C.sub }}>{label}</div>
        <div className="text-3xl font-bold tracking-tight" style={{ color: C.text }}>{value}</div>
      </Card>
    </motion.div>
  );
}

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS_LARGO = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function Dashboard({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: salesRaw } = await supabase.from("sales").select("*");
      const { data: items } = await supabase.from("sale_items").select("*");
      const { data: products } = await supabase.from("products").select("*");
      const all = salesRaw || [];
      const its = items || [];
      const prods = products || [];

      const hoy = new Date().toDateString();
      const ventasHoy = all.filter((s) => new Date(s.fecha).toDateString() === hoy);
      const facturacionHoy = ventasHoy.reduce((a, s) => a + Number(s.total || 0), 0);
      const gananciaHoy = ventasHoy.reduce((a, s) => a + Number(s.ganancia || 0), 0);
      const unidadesHoy = its.filter((it) => {
        const s = all.find((x) => x.id === it.sale_id);
        return s && new Date(s.fecha).toDateString() === hoy;
      }).reduce((a, it) => a + Number(it.cantidad || 0), 0);

      // Últimos 7 días
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const key = d.toDateString();
        const total = all.filter((s) => new Date(s.fecha).toDateString() === key)
          .reduce((a, s) => a + Number(s.total || 0), 0);
        return { name: DIAS[d.getDay()], ventas: total };
      });

      // Método de pago
      const metodos = {};
      all.forEach((s) => { metodos[s.metodo_pago] = (metodos[s.metodo_pago] || 0) + 1; });
      const totalV = all.length || 1;
      const colorMap = { efectivo: C.green, transferencia: C.blue, mercadopago: C.amber };
      const metodoPago = Object.entries(metodos).map(([name, v]) => ({
        name, value: Math.round((v / totalV) * 100), color: colorMap[name] || C.sub,
      }));

      // Ventas por día de la semana (facturación acumulada por día)
      const porDiaSemana = DIAS.map((d, idx) => {
        const total = all.filter((s) => new Date(s.fecha).getDay() === idx)
          .reduce((a, s) => a + Number(s.total || 0), 0);
        return { name: d, ventas: total, idx };
      });

      // Ventas por hora
      const porHora = Array.from({ length: 24 }, (_, h) => {
        const total = all.filter((s) => new Date(s.fecha).getHours() === h)
          .reduce((a, s) => a + Number(s.total || 0), 0);
        return { name: `${h}h`, ventas: total, h };
      }).filter((x) => x.h >= 6 && x.h <= 22); // franja comercial

      // Ventas por producto (unidades)
      const unidadesPorProd = {};
      its.forEach((it) => {
        const p = prods.find((x) => x.id === it.product_id);
        const nombre = p?.nombre || "—";
        unidadesPorProd[nombre] = (unidadesPorProd[nombre] || 0) + Number(it.cantidad || 0);
      });
      const totalUnidades = Object.values(unidadesPorProd).reduce((a, b) => a + b, 0) || 1;
      const porProducto = Object.entries(unidadesPorProd)
        .map(([name, v]) => ({ name, value: Math.round((v / totalUnidades) * 100), unidades: v }))
        .sort((a, b) => b.unidades - a.unidades);

      // Heatmap 20 semanas (por día, cantidad de maples vendidos)
      const hoyDate = new Date();
      const heatDias = 140; // 20 semanas
      const heatMap = {};
      its.forEach((it) => {
        const s = all.find((x) => x.id === it.sale_id);
        if (!s) return;
        const key = new Date(s.fecha).toDateString();
        heatMap[key] = (heatMap[key] || 0) + Number(it.cantidad || 0);
      });
      const heatData = [];
      for (let i = heatDias - 1; i >= 0; i--) {
        const d = new Date(hoyDate); d.setDate(d.getDate() - i);
        heatData.push({ date: d, value: heatMap[d.toDateString()] || 0 });
      }
      const maxHeat = Math.max(1, ...heatData.map((x) => x.value));

      // ANÁLISIS AUTOMÁTICO
      // Mejor día de la semana
      const conVentas = porDiaSemana.filter((d) => d.ventas > 0);
      const promDia = conVentas.length ? conVentas.reduce((a, d) => a + d.ventas, 0) / conVentas.length : 0;
      const mejorDia = [...porDiaSemana].sort((a, b) => b.ventas - a.ventas)[0];
      const mejorDiaPct = promDia > 0 && mejorDia.ventas > 0
        ? Math.round(((mejorDia.ventas - promDia) / promDia) * 100) : 0;

      // Hora pico
      const mejorHora = [...porHora].sort((a, b) => b.ventas - a.ventas)[0];
      const totalFacturado = all.reduce((a, s) => a + Number(s.total || 0), 0) || 1;
      const mejorHoraPct = mejorHora ? Math.round((mejorHora.ventas / totalFacturado) * 100) : 0;

      // Producto más rentable (mayor margen %)
      const margenPorProd = prods.map((p) => {
        const margen = p.precio_venta > 0 ? ((p.precio_venta - p.costo_actual) / p.precio_venta) * 100 : 0;
        return { nombre: p.nombre, margen: Math.round(margen) };
      }).sort((a, b) => b.margen - a.margen);
      const masRentable = margenPorProd[0];

      // Producto sin rotación (hace más días sin venderse)
      const ultimaVentaProd = {};
      its.forEach((it) => {
        const s = all.find((x) => x.id === it.sale_id);
        if (!s) return;
        const f = new Date(s.fecha).getTime();
        if (!ultimaVentaProd[it.product_id] || f > ultimaVentaProd[it.product_id]) {
          ultimaVentaProd[it.product_id] = f;
        }
      });
      let sinRotacion = null;
      prods.forEach((p) => {
        const ult = ultimaVentaProd[p.id];
        const dias = ult ? Math.floor((Date.now() - ult) / (1000 * 60 * 60 * 24)) : 999;
        if (!sinRotacion || dias > sinRotacion.dias) sinRotacion = { nombre: p.nombre, dias, nunca: !ult };
      });

      setStats({
        facturacionHoy, gananciaHoy, unidadesHoy, totalVentas: all.length,
        last7, metodoPago, porDiaSemana, porHora, porProducto,
        heatData, maxHeat,
        mejorDia, mejorDiaPct, mejorHora, mejorHoraPct, masRentable, sinRotacion,
        hayVentas: all.length > 0,
      });
      setLoading(false);
    })();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-20 justify-center" style={{ color: C.sub }}>
        <Loader2 size={20} className="animate-spin" /> Cargando datos…
      </div>
    );
  }

  const noData = stats.totalVentas === 0;

  const heatShade = (v) => {
    if (v === 0) return C.border;
    const r = v / stats.maxHeat;
    if (r < 0.25) return `${C.amber}40`;
    if (r < 0.5) return `${C.amber}70`;
    if (r < 0.75) return `${C.amber}A8`;
    return C.amber;
  };

  // Agrupar heatData en semanas (columnas)
  const semanas = [];
  for (let i = 0; i < stats.heatData.length; i += 7) {
    semanas.push(stats.heatData.slice(i, i + 7));
  }

  return (
    <div className="space-y-5">
      {noData && (
        <Card className="p-4" style={{ borderColor: C.amber }}>
          <div className="text-sm" style={{ color: C.text }}>
            👋 Todavía no cargaste ventas. Los análisis se van a ir llenando a medida que registres ventas.
          </div>
        </Card>
      )}

      {/* Hero cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Stat i={0} icon={Egg} label="Huevos vendidos hoy" value={stats.unidadesHoy.toLocaleString("es-AR")} color={C.amber} />
        <Stat i={1} icon={Wallet} label="Facturación hoy" value={money(stats.facturacionHoy)} color={C.green} />
        <Stat i={2} icon={TrendingUp} label="Ganancia hoy" value={money(stats.gananciaHoy)} color={C.blue} />
        <Stat i={3} icon={ShoppingCart} label="Ventas totales" value={stats.totalVentas.toLocaleString("es-AR")} color={C.amber} />
      </div>

      {/* Ventas 7 días + método de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-2">
          <Card className="p-5">
            <h3 className="font-semibold mb-4" style={{ color: C.text }}>Ventas últimos 7 días</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.last7} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="a7" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.amber} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" stroke={C.sub} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={C.sub} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<ChartTip fmt={money} />} cursor={{ stroke: C.border }} />
                <Area type="monotone" dataKey="ventas" stroke={C.amber} strokeWidth={2.5} fill="url(#a7)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-5">
            <h3 className="font-semibold mb-4" style={{ color: C.text }}>Método de pago</h3>
            {stats.metodoPago.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: C.sub }}>Sin datos aún</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={stats.metodoPago} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                      {stats.metodoPago.map((m) => <Cell key={m.name} fill={m.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTip fmt={(v) => v + "%"} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {stats.metodoPago.map((m) => (
                    <div key={m.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 capitalize" style={{ color: C.sub }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: m.color }} />{m.name}
                      </span>
                      <span style={{ color: C.text }} className="font-semibold">{m.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Heatmap + Análisis automático */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-2">
          <Card className="p-5">
            <h3 className="font-semibold" style={{ color: C.text }}>Actividad de ventas</h3>
            <p className="text-xs mb-4" style={{ color: C.sub }}>Últimas 20 semanas · más oscuro = más maples</p>
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-[3px]">
                {semanas.map((sem, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {sem.map((d, di) => (
                      <div key={di} title={`${d.value} maples · ${d.date.toLocaleDateString("es-AR")}`}
                        style={{ width: 12, height: 12, borderRadius: 3, background: heatShade(d.value) }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-[11px]" style={{ color: C.sub }}>
              Menos
              {[C.border, `${C.amber}40`, `${C.amber}70`, `${C.amber}A8`, C.amber].map((c, i) => (
                <span key={i} style={{ width: 11, height: 11, borderRadius: 3, background: c }} />
              ))}
              Más
            </div>
          </Card>
        </motion.div>

        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-5">
            <h3 className="font-semibold" style={{ color: C.text }}>Análisis automático</h3>
            <p className="text-xs mb-4" style={{ color: C.sub }}>Detectado por el sistema</p>
            {!stats.hayVentas ? (
              <div className="py-6 text-center text-sm" style={{ color: C.sub }}>
                Cargá ventas para ver los análisis.
              </div>
            ) : (
              <div className="space-y-3">
                <Insight icon={TrendingUp} color={C.green} titulo="Mejor día"
                  valor={stats.mejorDia?.ventas > 0 ? DIAS_LARGO[stats.mejorDia.idx] : "—"}
                  detalle={stats.mejorDiaPct > 0 ? `+${stats.mejorDiaPct}% sobre el promedio` : "Aún con pocos datos"} />
                <Insight icon={Clock} color={C.amber} titulo="Hora pico"
                  valor={stats.mejorHora?.ventas > 0 ? stats.mejorHora.name : "—"}
                  detalle={stats.mejorHoraPct > 0 ? `El ${stats.mejorHoraPct}% de lo facturado` : "Aún con pocos datos"} />
                <Insight icon={Egg} color={C.blue} titulo="Más rentable"
                  valor={stats.masRentable?.nombre || "—"}
                  detalle={stats.masRentable ? `Margen del ${stats.masRentable.margen}%` : "Cargá productos"} />
                <Insight icon={TrendingDown} color={C.red} titulo="Sin rotación"
                  valor={stats.sinRotacion?.nombre || "—"}
                  detalle={stats.sinRotacion?.nunca ? "Nunca se vendió" : stats.sinRotacion ? `Hace ${stats.sinRotacion.dias} días` : "—"} />
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Gráficos extra: por hora, por día de semana, por producto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div custom={8} variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-5">
            <h3 className="font-semibold mb-4" style={{ color: C.text }}>Ventas por hora</h3>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={stats.porHora} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke={C.sub} fontSize={9} tickLine={false} axisLine={false} interval={2} />
                <YAxis hide />
                <Tooltip content={<ChartTip fmt={money} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="ventas" radius={[4, 4, 0, 0]} fill={C.blue} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div custom={9} variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-5">
            <h3 className="font-semibold mb-4" style={{ color: C.text }}>Ventas por día</h3>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={stats.porDiaSemana} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke={C.sub} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip content={<ChartTip fmt={money} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="ventas" radius={[4, 4, 0, 0]} fill={C.amber} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div custom={10} variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-5">
            <h3 className="font-semibold mb-4" style={{ color: C.text }}>Ventas por producto</h3>
            {stats.porProducto.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: C.sub }}>Sin datos aún</div>
            ) : (
              <div className="space-y-2.5 mt-1">
                {stats.porProducto.map((p) => (
                  <div key={p.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: C.sub }}>{p.name}</span>
                      <span style={{ color: C.text }} className="font-semibold">{p.value}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: C.bg }}>
                      <div className="h-full rounded-full" style={{ background: C.amber, width: `${p.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Insight({ icon: Icon, color, titulo, valor, detalle }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: C.bg }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}1A` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px]" style={{ color: C.sub }}>{titulo}</div>
        <div className="text-sm font-semibold truncate" style={{ color: C.text }}>{valor}</div>
        <div className="text-[11px] mt-0.5" style={{ color: C.sub }}>{detalle}</div>
      </div>
    </div>
  );
}

const MAPLES_POR_CAJON = 12;

function Stock({ toast, refreshKey, bump }) {
  const [products, setProducts] = useState([]);
  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: "", unidad: "cajon", cantidad: 1, tipo: "entrada" });

  const load = useCallback(async () => {
    setLoading(true);
    const { data: prods } = await supabase.from("products").select("*").eq("activo", true);
    const { data: m } = await supabase.from("stock_movements").select("*").order("fecha", { ascending: false });
    setProducts(prods || []);
    setMovs(m || []);
    if (prods?.[0]) setForm((f) => ({ ...f, product_id: f.product_id || prods[0].id }));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  // Stock por producto = entradas - salidas (todo en maples)
  const stockPorProducto = products.map((p) => {
    const relacionados = movs.filter((m) => m.product_id === p.id);
    const total = relacionados.reduce((acc, m) => {
      const suma = ["entrada"].includes(m.tipo) ? Number(m.cantidad) : -Number(m.cantidad);
      return acc + suma;
    }, 0);
    return { ...p, maples: total };
  });

  const totalMaples = stockPorProducto.reduce((a, p) => a + p.maples, 0);

  const cargar = async () => {
    if (!form.product_id) return toast("Elegí un producto", "err");
    const cant = Number(form.cantidad) || 0;
    if (cant <= 0) return toast("La cantidad debe ser mayor a 0", "err");
    setSaving(true);
    // Convertir a maples si viene por cajón
    const maples = form.unidad === "cajon" ? cant * MAPLES_POR_CAJON : cant;
    const { error } = await supabase.from("stock_movements").insert({
      product_id: form.product_id,
      tipo: "entrada",
      cantidad: maples,
      motivo: form.unidad === "cajon" ? `${cant} cajón/es (${maples} maples)` : `${maples} maples`,
    });
    setSaving(false);
    if (error) return toast(error.message, "err");
    toast(`Entrada cargada: +${maples} maples`);
    setForm({ ...form, cantidad: 1 });
    load();
    bump && bump();
  };

  const borrarMov = async (id) => {
    if (!window.confirm("¿Borrar este movimiento? El stock se va a recalcular. Esta acción no se puede deshacer.")) return;
    const { error } = await supabase.from("stock_movements").delete().eq("id", id);
    if (error) return toast(error.message, "err");
    toast("Movimiento borrado");
    load();
    bump && bump();
  };

  const inp = { background: C.bg, border: `1px solid ${C.border}`, color: C.text };

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${C.amber}1A` }}>
              <Boxes size={18} style={{ color: C.amber }} />
            </div>
            <div className="text-sm mb-1" style={{ color: C.sub }}>Stock total</div>
            <div className="text-3xl font-bold tracking-tight" style={{ color: C.text }}>
              {totalMaples.toLocaleString("es-AR")} <span className="text-lg" style={{ color: C.sub }}>maples</span>
            </div>
            <div className="text-sm mt-1" style={{ color: C.sub }}>
              ≈ {Math.floor(totalMaples / MAPLES_POR_CAJON)} cajones
              {totalMaples % MAPLES_POR_CAJON > 0 && ` y ${totalMaples % MAPLES_POR_CAJON} maples`}
            </div>
          </Card>
        </motion.div>
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-5">
            <div className="text-sm mb-3 font-medium" style={{ color: C.text }}>Stock por producto</div>
            {stockPorProducto.length === 0 ? (
              <div className="text-sm" style={{ color: C.sub }}>Sin productos aún</div>
            ) : (
              <div className="space-y-2">
                {stockPorProducto.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span style={{ color: C.sub }}>{p.nombre}</span>
                    <span style={{ color: C.text }} className="font-semibold">
                      {p.maples} maples
                      <span style={{ color: C.sub }} className="font-normal"> ({Math.floor(p.maples / MAPLES_POR_CAJON)} caj.)</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Cargar entrada */}
      <Card className="p-5">
        <h3 className="font-semibold mb-1" style={{ color: C.text }}>Cargar entrada de stock</h3>
        <p className="text-xs mb-4" style={{ color: C.sub }}>Un cajón son {MAPLES_POR_CAJON} maples. Elegí en qué unidad cargás.</p>
        {products.length === 0 ? (
          <div className="p-4 rounded-xl text-sm" style={{ background: C.bg, color: C.sub }}>
            Primero cargá un producto en <b style={{ color: C.amber }}>Productos</b>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: C.sub }}>Producto</label>
              <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inp}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: C.sub }}>Unidad</label>
              <select value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inp}>
                <option value="cajon">Cajón (12 maples)</option>
                <option value="maple">Maple suelto</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: C.sub }}>Cantidad</label>
              <input type="number" min={1} value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={cargar} disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: C.amber, color: "#0B0F19" }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Cargar
            </motion.button>
          </div>
        )}
        {form.unidad === "cajon" && Number(form.cantidad) > 0 && (
          <div className="text-xs mt-3" style={{ color: C.green }}>
            Vas a sumar {Number(form.cantidad) * MAPLES_POR_CAJON} maples al stock.
          </div>
        )}
      </Card>

      {/* Historial de movimientos */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4" style={{ color: C.text }}>Movimientos recientes</h3>
        {loading ? (
          <div className="flex items-center gap-2 py-8 justify-center" style={{ color: C.sub }}>
            <Loader2 size={18} className="animate-spin" /> Cargando…
          </div>
        ) : movs.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: C.sub }}>
            Todavía no hay movimientos. Cargá una entrada arriba.
          </div>
        ) : (
          <div className="space-y-2">
            {movs.slice(0, 30).map((m) => {
              const prod = products.find((p) => p.id === m.product_id);
              const esEntrada = m.tipo === "entrada";
              return (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.bg }}>
                  <div>
                    <div className="font-medium text-sm capitalize" style={{ color: C.text }}>
                      {esEntrada ? "Entrada" : "Salida"} · {prod?.nombre || "—"}
                    </div>
                    <div className="text-xs" style={{ color: C.sub }}>
                      {m.motivo} · {new Date(m.fecha).toLocaleString("es-AR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold" style={{ color: esEntrada ? C.green : C.red }}>
                      {esEntrada ? "+" : "−"}{m.cantidad} maples
                    </div>
                    <button onClick={() => borrarMov(m.id)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: C.red }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function IAChat({ toast }) {
  const [mensajes, setMensajes] = useState([
    { de: "ia", texto: "¡Hola Patricio! Soy el asistente de tu negocio. Preguntame cosas como: \"¿cuánto vendí hoy?\", \"¿cuál es mi mejor día?\", \"¿cuánto stock tengo?\" o \"¿cuál es mi producto más vendido?\"." },
  ]);
  const [input, setInput] = useState("");
  const [pensando, setPensando] = useState(false);
  const finRef = useRef(null);

  useEffect(() => { finRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensajes]);

  const responder = async (pregunta) => {
    const q = pregunta.toLowerCase();
    // Traer datos frescos
    const { data: sales } = await supabase.from("sales").select("*");
    const { data: items } = await supabase.from("sale_items").select("*");
    const { data: products } = await supabase.from("products").select("*");
    const { data: movs } = await supabase.from("stock_movements").select("*");
    const all = sales || [], its = items || [], prods = products || [], mv = movs || [];

    const hoy = new Date().toDateString();
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const hace7 = new Date(); hace7.setDate(hace7.getDate() - 7);

    const sum = (arr, campo) => arr.reduce((a, s) => a + Number(s[campo] || 0), 0);
    const ventasHoy = all.filter((s) => new Date(s.fecha).toDateString() === hoy);
    const ventasMes = all.filter((s) => new Date(s.fecha) >= inicioMes);
    const ventasSemana = all.filter((s) => new Date(s.fecha) >= hace7);

    // Detección de intención
    const tiene = (...palabras) => palabras.some((p) => q.includes(p));

    // GANANCIA
    if (tiene("ganancia", "gané", "gane", "gano")) {
      if (tiene("mes")) return `Este mes ganaste ${money(sum(ventasMes, "ganancia"))} en ${ventasMes.length} ventas.`;
      if (tiene("semana")) return `En los últimos 7 días ganaste ${money(sum(ventasSemana, "ganancia"))}.`;
      return `Hoy ganaste ${money(sum(ventasHoy, "ganancia"))} en ${ventasHoy.length} ventas.`;
    }

    // VENTAS / FACTURACIÓN
    if (tiene("vendí", "vendi", "vendido", "facturación", "facturacion", "facturé", "venta")) {
      if (tiene("mes")) return `Este mes vendiste ${money(sum(ventasMes, "total"))} en ${ventasMes.length} ventas.`;
      if (tiene("semana")) return `En los últimos 7 días vendiste ${money(sum(ventasSemana, "total"))} en ${ventasSemana.length} ventas.`;
      if (tiene("total", "cuántas", "cuantas", "cuántos", "cuantos")) return `En total tenés ${all.length} ventas registradas, por ${money(sum(all, "total"))}.`;
      return `Hoy vendiste ${money(sum(ventasHoy, "total"))} en ${ventasHoy.length} ventas.`;
    }

    // MEJOR DÍA
    if (tiene("mejor día", "mejor dia", "qué día", "que dia")) {
      const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const porDia = DIAS.map((d, i) => ({
        dia: d, total: all.filter((s) => new Date(s.fecha).getDay() === i).reduce((a, s) => a + Number(s.total || 0), 0),
      }));
      const mejor = [...porDia].sort((a, b) => b.total - a.total)[0];
      if (mejor.total === 0) return "Todavía no tengo suficientes ventas para saber tu mejor día. Cargá algunas más.";
      return `Tu mejor día es el ${mejor.dia}, con ${money(mejor.total)} acumulados.`;
    }

    // HORA PICO
    if (tiene("hora", "horario")) {
      const porHora = {};
      all.forEach((s) => { const h = new Date(s.fecha).getHours(); porHora[h] = (porHora[h] || 0) + Number(s.total || 0); });
      const entradas = Object.entries(porHora).sort((a, b) => b[1] - a[1]);
      if (entradas.length === 0) return "Todavía no hay ventas para calcular la hora pico.";
      return `Tu hora de mayor venta es a las ${entradas[0][0]}h, con ${money(entradas[0][1])} acumulados.`;
    }

    // PRODUCTO MÁS VENDIDO
    if (tiene("más vendido", "mas vendido", "producto que más", "qué producto", "que producto", "producto estrella")) {
      const porProd = {};
      its.forEach((it) => {
        const p = prods.find((x) => x.id === it.product_id);
        const n = p?.nombre || "—";
        porProd[n] = (porProd[n] || 0) + Number(it.cantidad || 0);
      });
      const orden = Object.entries(porProd).sort((a, b) => b[1] - a[1]);
      if (orden.length === 0) return "Todavía no vendiste ningún producto.";
      return `Tu producto más vendido es "${orden[0][0]}" con ${orden[0][1]} maples vendidos.`;
    }

    // STOCK
    if (tiene("stock", "cuánto tengo", "cuanto tengo", "cuántos maples", "cuantos maples", "cajones")) {
      const totalMaples = mv.reduce((a, m) => a + (m.tipo === "entrada" ? Number(m.cantidad) : -Number(m.cantidad)), 0);
      const cajones = Math.floor(totalMaples / 12);
      return `Tenés ${totalMaples} maples en stock (aproximadamente ${cajones} cajones).`;
    }

    // TICKET PROMEDIO
    if (tiene("ticket", "promedio", "compra promedio")) {
      if (all.length === 0) return "Todavía no hay ventas para calcular el ticket promedio.";
      return `Tu ticket promedio es ${money(sum(all, "total") / all.length)} por venta.`;
    }

    // CANTIDAD DE VENTAS
    if (tiene("cuántas ventas", "cuantas ventas", "número de ventas")) {
      return `Tenés ${all.length} ventas en total. Hoy hiciste ${ventasHoy.length}.`;
    }

    // No entendió
    return "Mmm, todavía no sé responder eso. Probá preguntándome sobre: ventas (hoy/semana/mes), ganancia, mejor día, hora pico, producto más vendido, stock o ticket promedio.";
  };

  const enviar = async () => {
    const pregunta = input.trim();
    if (!pregunta || pensando) return;
    setMensajes((m) => [...m, { de: "user", texto: pregunta }]);
    setInput("");
    setPensando(true);
    // Pequeña demora para que se sienta natural
    await new Promise((r) => setTimeout(r, 400));
    try {
      const respuesta = await responder(pregunta);
      setMensajes((m) => [...m, { de: "ia", texto: respuesta }]);
    } catch (e) {
      setMensajes((m) => [...m, { de: "ia", texto: "Uy, tuve un problema para leer los datos. Probá de nuevo." }]);
    }
    setPensando(false);
  };

  const sugerencias = ["¿Cuánto vendí hoy?", "¿Cuál es mi mejor día?", "¿Cuánto stock tengo?", "¿Producto más vendido?"];

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-0 overflow-hidden flex flex-col" style={{ height: "70vh" }}>
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${C.amber}1A` }}>
            <Sparkles size={18} style={{ color: C.amber }} />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: C.text }}>Preguntale al negocio</div>
            <div className="text-[11px]" style={{ color: C.sub }}>Responde con tus datos reales</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {mensajes.map((m, i) => (
            <div key={i} className={`flex ${m.de === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm"
                style={{
                  background: m.de === "user" ? C.amber : C.bg,
                  color: m.de === "user" ? "#0B0F19" : C.text,
                  borderBottomRightRadius: m.de === "user" ? 4 : 16,
                  borderBottomLeftRadius: m.de === "user" ? 16 : 4,
                }}>
                {m.texto}
              </div>
            </div>
          ))}
          {pensando && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 rounded-2xl text-sm flex items-center gap-2" style={{ background: C.bg, color: C.sub }}>
                <Loader2 size={14} className="animate-spin" /> Pensando…
              </div>
            </div>
          )}
          <div ref={finRef} />
        </div>

        {mensajes.length <= 1 && (
          <div className="px-5 pb-2 flex flex-wrap gap-2">
            {sugerencias.map((s) => (
              <button key={s} onClick={() => { setInput(s); }}
                className="text-xs px-3 py-1.5 rounded-full" style={{ background: C.bg, color: C.sub, border: `1px solid ${C.border}` }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 flex gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            placeholder="Escribí tu pregunta…"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
          <motion.button whileTap={{ scale: 0.95 }} onClick={enviar} disabled={pensando}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: C.amber, color: "#0B0F19" }}>
            Enviar
          </motion.button>
        </div>
      </Card>
    </div>
  );
}

const CATEGORIAS_GASTO = ["Mercadería", "Transporte", "Servicios", "Sueldos", "Alquiler", "Impuestos", "Otros"];

function Gastos({ toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const ahoraLocal = () => {
    const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [form, setForm] = useState({ categoria: "Mercadería", monto: "", descripcion: "", fecha: ahoraLocal() });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("expenses").select("*").order("fecha", { ascending: false });
    if (error) toast(error.message, "err"); else setItems(data || []);
    setLoading(false);
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!(Number(form.monto) > 0)) return toast("Poné un monto válido", "err");
    setSaving(true);
    const { error } = await supabase.from("expenses").insert({
      categoria: form.categoria, monto: Number(form.monto),
      descripcion: form.descripcion, fecha: new Date(form.fecha).toISOString(),
    });
    setSaving(false);
    if (error) return toast(error.message, "err");
    toast("Gasto registrado");
    setForm({ categoria: "Mercadería", monto: "", descripcion: "", fecha: ahoraLocal() });
    load();
  };

  const del = async (id) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) return toast(error.message, "err");
    toast("Gasto eliminado"); load();
  };

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const gastoMes = items.filter((g) => new Date(g.fecha) >= inicioMes).reduce((a, g) => a + Number(g.monto || 0), 0);
  const inp = { background: C.bg, border: `1px solid ${C.border}`, color: C.text };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="text-sm mb-1" style={{ color: C.sub }}>Gastos de este mes</div>
        <div className="text-3xl font-bold" style={{ color: C.red }}>{money(gastoMes)}</div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-4" style={{ color: C.text }}>Nuevo gasto</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none" style={inp}>
            {CATEGORIAS_GASTO.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="Monto" type="number" value={form.monto}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
          <input type="datetime-local" value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
          <input placeholder="Nota (opcional)" value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={add} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: C.amber, color: "#0B0F19" }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Registrar gasto
        </motion.button>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-4" style={{ color: C.text }}>Historial de gastos</h3>
        {loading ? (
          <div className="flex items-center gap-2 py-8 justify-center" style={{ color: C.sub }}>
            <Loader2 size={18} className="animate-spin" /> Cargando…
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: C.sub }}>Todavía no registraste gastos.</div>
        ) : (
          <div className="space-y-2">
            {items.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.bg }}>
                <div>
                  <div className="font-medium text-sm" style={{ color: C.text }}>{g.categoria}</div>
                  <div className="text-xs" style={{ color: C.sub }}>
                    {g.descripcion ? `${g.descripcion} · ` : ""}{new Date(g.fecha).toLocaleDateString("es-AR")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold" style={{ color: C.red }}>−{money(g.monto)}</div>
                  <button onClick={() => del(g.id)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: C.red }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Reportes({ toast }) {
  const [generando, setGenerando] = useState(false);

  const generarPDF = async () => {
    setGenerando(true);
    const { data: sales } = await supabase.from("sales").select("*").order("fecha", { ascending: false });
    const { data: expenses } = await supabase.from("expenses").select("*").order("fecha", { ascending: false });
    const all = sales || [], gastos = expenses || [];

    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const ventasMes = all.filter((s) => new Date(s.fecha) >= inicioMes);
    const gastosMes = gastos.filter((g) => new Date(g.fecha) >= inicioMes);
    const totalVentas = ventasMes.reduce((a, s) => a + Number(s.total || 0), 0);
    const totalGanancia = ventasMes.reduce((a, s) => a + Number(s.ganancia || 0), 0);
    const totalGastos = gastosMes.reduce((a, g) => a + Number(g.monto || 0), 0);
    const neto = totalGanancia - totalGastos;

    const filasVentas = ventasMes.slice(0, 100).map((s) => `
      <tr><td>${new Date(s.fecha).toLocaleString("es-AR")}</td><td>${s.metodo_pago}</td>
      <td style="text-align:right">${money(s.total)}</td><td style="text-align:right;color:#16a34a">${money(s.ganancia)}</td></tr>`).join("");
    const filasGastos = gastosMes.slice(0, 100).map((g) => `
      <tr><td>${new Date(g.fecha).toLocaleDateString("es-AR")}</td><td>${g.categoria}</td>
      <td>${g.descripcion || ""}</td><td style="text-align:right;color:#dc2626">${money(g.monto)}</td></tr>`).join("");

    const mesNombre = ahora.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    const html = `
      <html><head><meta charset="utf-8"><title>Reporte Don Stefano</title>
      <style>
        body{font-family:system-ui,Arial,sans-serif;padding:40px;color:#111}
        h1{color:#F59E0B;margin-bottom:0} .sub{color:#666;margin-top:4px}
        .cards{display:flex;gap:16px;margin:24px 0;flex-wrap:wrap}
        .card{border:1px solid #ddd;border-radius:12px;padding:16px;flex:1;min-width:140px}
        .card .lbl{font-size:12px;color:#666} .card .val{font-size:22px;font-weight:bold;margin-top:4px}
        table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
        th{text-align:left;border-bottom:2px solid #333;padding:8px}
        td{border-bottom:1px solid #eee;padding:8px}
        h2{margin-top:32px;border-left:4px solid #F59E0B;padding-left:10px}
      </style></head><body>
      <h1>Don Stefano · ERP Huevos</h1>
      <div class="sub">Reporte de ${mesNombre} · generado el ${ahora.toLocaleString("es-AR")}</div>
      <div class="cards">
        <div class="card"><div class="lbl">Facturación</div><div class="val">${money(totalVentas)}</div></div>
        <div class="card"><div class="lbl">Ganancia bruta</div><div class="val" style="color:#16a34a">${money(totalGanancia)}</div></div>
        <div class="card"><div class="lbl">Gastos</div><div class="val" style="color:#dc2626">${money(totalGastos)}</div></div>
        <div class="card"><div class="lbl">Neto</div><div class="val" style="color:${neto >= 0 ? "#16a34a" : "#dc2626"}">${money(neto)}</div></div>
      </div>
      <h2>Ventas del mes (${ventasMes.length})</h2>
      <table><tr><th>Fecha</th><th>Pago</th><th style="text-align:right">Total</th><th style="text-align:right">Ganancia</th></tr>${filasVentas || '<tr><td colspan="4">Sin ventas</td></tr>'}</table>
      <h2>Gastos del mes (${gastosMes.length})</h2>
      <table><tr><th>Fecha</th><th>Categoría</th><th>Nota</th><th style="text-align:right">Monto</th></tr>${filasGastos || '<tr><td colspan="4">Sin gastos</td></tr>'}</table>
      </body></html>`;

    const win = window.open("", "_blank");
    if (!win) { setGenerando(false); return toast("Permití las ventanas emergentes para generar el PDF", "err"); }
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
    setGenerando(false);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <Card className="p-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${C.amber}1A` }}>
          <FileBarChart size={22} style={{ color: C.amber }} />
        </div>
        <h3 className="font-semibold text-lg mb-1" style={{ color: C.text }}>Reporte mensual</h3>
        <p className="text-sm mb-5" style={{ color: C.sub }}>
          Generá un PDF con las ventas, gastos y el resumen del mes actual. Se abre la ventana de impresión: elegí "Guardar como PDF".
        </p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={generarPDF} disabled={generando}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: C.amber, color: "#0B0F19" }}>
          {generando ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Generar PDF del mes
        </motion.button>
      </Card>
    </div>
  );
}

function Objetivos({ toast }) {
  const [goals, setGoals] = useState([]);
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titulo: "", objetivo_cajones: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const { data: g } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    const { data: its } = await supabase.from("sale_items").select("*");
    const { data: s } = await supabase.from("sales").select("*");
    setGoals(g || []); setItems(its || []); setSales(s || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.titulo.trim()) return toast("Poné un título", "err");
    if (!(Number(form.objetivo_cajones) > 0)) return toast("Poné cuántos cajones", "err");
    setSaving(true);
    const { error } = await supabase.from("goals").insert({
      titulo: form.titulo.trim(),
      objetivo_maples: Number(form.objetivo_cajones) * 12,
    });
    setSaving(false);
    if (error) return toast(error.message, "err");
    toast("Objetivo creado");
    setForm({ titulo: "", objetivo_cajones: "" });
    load();
  };

  const del = async (id) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) return toast(error.message, "err");
    toast("Objetivo eliminado"); load();
  };

  // Maples vendidos desde el inicio del objetivo
  const maplesDesde = (fechaInicio) => {
    const ini = new Date(fechaInicio).getTime();
    return items.filter((it) => {
      const s = sales.find((x) => x.id === it.sale_id);
      return s && new Date(s.fecha).getTime() >= ini;
    }).reduce((a, it) => a + Number(it.cantidad || 0), 0);
  };

  const inp = { background: C.bg, border: `1px solid ${C.border}`, color: C.text };

  // Estrategias según progreso
  const estrategias = (pct) => {
    if (pct >= 100) return ["¡Objetivo cumplido! Subí la meta para el próximo período.", "Fidelizá a tus mejores clientes con un pequeño beneficio.", "Analizá qué día y horario funcionó mejor y reforzá ahí."];
    if (pct >= 70) return ["Estás cerca. Ofrecé descuento por cajón entero para acelerar.", "Contactá a clientes que hace tiempo no compran.", "Reforzá el stock de tu producto más vendido para no quedarte sin."];
    if (pct >= 40) return ["Vas por la mitad. Publicá en Marketplace y redes para sumar ventas.", "Armá un combo (cajón + descuento) para subir el ticket promedio.", "Aprovechá tu mejor día de la semana con una promo puntual."];
    return ["Recién arrancás. Difundí que vendés huevos por maple y por cajón.", "Ofrecé el primer pedido con un pequeño descuento para captar clientes.", "Pedí a conocidos que te recomienden; el boca a boca es clave al inicio.", "Asegurate de tener stock cargado para no perder ventas."];
  };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h3 className="font-semibold mb-4" style={{ color: C.text }}>Nuevo objetivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input placeholder="Título (ej: Meta de julio)" value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none md:col-span-2" style={inp} />
          <input placeholder="Cajones a vender" type="number" value={form.objetivo_cajones}
            onChange={(e) => setForm({ ...form, objetivo_cajones: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none" style={inp} />
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={add} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: C.amber, color: "#0B0F19" }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Crear objetivo
        </motion.button>
      </Card>

      {loading ? (
        <div className="flex items-center gap-2 py-8 justify-center" style={{ color: C.sub }}>
          <Loader2 size={18} className="animate-spin" /> Cargando…
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-sm" style={{ color: C.sub }}>Todavía no tenés objetivos. Creá el primero arriba.</div>
        </Card>
      ) : (
        goals.map((g) => {
          const vendidos = maplesDesde(g.fecha_inicio || g.created_at);
          const objetivoCajones = Math.round(g.objetivo_maples / 12);
          const vendidosCajones = Math.floor(vendidos / 12);
          const pct = g.objetivo_maples > 0 ? Math.min(100, Math.round((vendidos / g.objetivo_maples) * 100)) : 0;
          const faltanCajones = Math.max(0, objetivoCajones - vendidosCajones);
          return (
            <Card key={g.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.amber}1A` }}>
                    <TargetIcon size={18} style={{ color: C.amber }} />
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: C.text }}>{g.titulo}</div>
                    <div className="text-xs" style={{ color: C.sub }}>Meta: {objetivoCajones} cajones ({g.objetivo_maples} maples)</div>
                  </div>
                </div>
                <button onClick={() => del(g.id)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: C.red }}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-end justify-between mb-2">
                <div className="text-2xl font-bold" style={{ color: C.text }}>{pct}%</div>
                <div className="text-sm" style={{ color: C.sub }}>
                  {vendidosCajones} de {objetivoCajones} cajones {faltanCajones > 0 && `· faltan ${faltanCajones}`}
                </div>
              </div>
              <div className="h-3 rounded-full mb-5" style={{ background: C.bg }}>
                <div className="h-full rounded-full transition-all" style={{ background: pct >= 100 ? C.green : C.amber, width: `${pct}%` }} />
              </div>

              <div className="p-4 rounded-xl" style={{ background: C.bg }}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={15} style={{ color: C.amber }} />
                  <span className="text-sm font-semibold" style={{ color: C.text }}>Estrategias para vender más</span>
                </div>
                <ul className="space-y-2">
                  {estrategias(pct).map((e, i) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: C.sub }}>
                      <span style={{ color: C.amber }}>•</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

function Placeholder({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${C.amber}1A` }}>
        <Sparkles size={24} style={{ color: C.amber }} />
      </div>
      <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>{label}</h2>
      <p className="text-sm" style={{ color: C.sub }}>Esta sección llega en el próximo paso.</p>
    </div>
  );
}

function CommandPalette({ open, onClose, onNav }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);
  const items = nav.filter((n) => n.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center pt-32"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
          <motion.div onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.96, y: -8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, width: 560 }}
            className="overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: C.border }}>
              <Search size={18} style={{ color: C.sub }} />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar pantalla…" className="bg-transparent outline-none flex-1 text-sm" style={{ color: C.text }} />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.border, color: C.sub }}>ESC</kbd>
            </div>
            <div className="max-h-72 overflow-y-auto py-2">
              {items.map((n) => (
                <button key={n.key} onClick={() => { onNav(n.key); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition" style={{ color: C.text }}>
                  <n.icon size={16} style={{ color: C.sub }} />{n.label}
                  <ChevronRight size={14} className="ml-auto" style={{ color: C.sub }} />
                </button>
              ))}
              {items.length === 0 && <div className="px-4 py-6 text-sm text-center" style={{ color: C.sub }}>Sin resultados</div>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const entrar = async () => {
    if (!email.trim() || !pass) { setError("Completá usuario y contraseña"); return; }
    setCargando(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    setCargando(false);
    if (error) { setError("Usuario o contraseña incorrectos"); return; }
    onLogin();
  };

  const inp = { background: C.bg, border: `1px solid ${C.border}`, color: C.text };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: C.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24 }}
        className="w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: C.amber }}>
            <Egg size={28} color="#0B0F19" />
          </div>
          <div className="font-bold text-lg" style={{ color: C.text }}>Don Stefano</div>
          <div className="text-xs" style={{ color: C.sub }}>ERP Huevos</div>
        </div>

        <label className="text-xs font-medium mb-1.5 block" style={{ color: C.sub }}>Usuario (email)</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          placeholder="tucorreo@ejemplo.com" autoComplete="username"
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none mb-4" style={inp} />

        <label className="text-xs font-medium mb-1.5 block" style={{ color: C.sub }}>Contraseña</label>
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          placeholder="••••••••" autoComplete="current-password"
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none mb-4" style={inp} />

        {error && <div className="text-xs mb-4 text-center" style={{ color: C.red }}>{error}</div>}

        <motion.button whileTap={{ scale: 0.97 }} onClick={entrar} disabled={cargando}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: C.amber, color: "#0B0F19" }}>
          {cargando ? <Loader2 size={16} className="animate-spin" /> : null} Entrar
        </motion.button>
      </motion.div>
    </div>
  );
}

function AppInterna({ onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // menú móvil
  const [refreshKey, setRefreshKey] = useState(0);
  const { show, node } = useToast();
  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen((v) => !v); }
      if (e.key === "Escape") { setCmdOpen(false); setSaleOpen(false); setMenuOpen(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  const render = () => {
    switch (active) {
      case "dashboard": return <Dashboard refreshKey={refreshKey} />;
      case "ventas": return <Ventas toast={show} refreshKey={refreshKey} />;
      case "productos": return <Productos toast={show} />;
      case "stock": return <Stock toast={show} refreshKey={refreshKey} bump={refresh} />;
      case "ia": return <IAChat toast={show} />;
      case "gastos": return <Gastos toast={show} />;
      case "reportes": return <Reportes toast={show} />;
      case "objetivos": return <Objetivos toast={show} />;
      default: return <Placeholder label={nav.find((n) => n.key === active)?.label} />;
    }
  };

  const goTo = (key) => { setActive(key); setMenuOpen(false); };

  // Contenido del menú (se usa en desktop fijo y en el drawer móvil)
  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2.5 px-2 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.amber }}>
          <Egg size={20} color="#0B0F19" />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">Don Stefano</div>
          <div className="text-[11px]" style={{ color: C.sub }}>ERP Huevos</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {nav.map((n) => {
          const on = active === n.key;
          return (
            <button key={n.key} onClick={() => goTo(n.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative"
              style={{ background: on ? `${C.amber}14` : "transparent", color: on ? C.text : C.sub }}>
              {on && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full" style={{ background: C.amber }} />}
              <n.icon size={17} style={{ color: on ? C.amber : C.sub }} />{n.label}
            </button>
          );
        })}
      </nav>
      <div className="flex items-center gap-3 px-2 pt-4 mt-2" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm" style={{ background: `${C.blue}33`, color: C.blue }}>P</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">Mi negocio</div>
          <div className="text-[11px] truncate" style={{ color: C.sub }}>Sesión activa</div>
        </div>
        <button onClick={onLogout} title="Cerrar sesión" className="p-2 rounded-lg hover:bg-white/5">
          <X size={16} style={{ color: C.sub }} />
        </button>
      </div>
    </>
  );

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }} className="flex">
      {/* Sidebar fija (solo desktop) */}
      <aside className="hidden lg:flex w-60 shrink-0 h-screen sticky top-0 flex-col p-4" style={{ borderRight: `1px solid ${C.border}` }}>
        <SidebarContent />
      </aside>

      {/* Drawer móvil */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.6)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col p-4 lg:hidden"
              style={{ background: C.card, borderRight: `1px solid ${C.border}`, paddingTop: "max(1rem, env(safe-area-inset-top))" }}
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-4 flex items-center gap-3"
          style={{ background: "rgba(11,15,25,0.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          {/* Botón hamburguesa (solo móvil) */}
          <button onClick={() => setMenuOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <Menu size={20} style={{ color: C.text }} />
          </button>

          <div className="min-w-0">
            <h1 className="font-bold text-base sm:text-lg leading-tight truncate">Hola Patricio 👋</h1>
            <p className="text-xs capitalize truncate" style={{ color: C.sub }}>{today}</p>
          </div>

          {/* Buscador (solo desktop) */}
          <button onClick={() => setCmdOpen(true)}
            className="ml-auto hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-64 transition hover:brightness-125"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.sub }}>
            <Search size={15} /><span className="flex-1 text-left">Buscar…</span>
            <kbd className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.border }}><Command size={10} />K</kbd>
          </button>

          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSaleOpen(true)}
            className="ml-auto md:ml-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold shrink-0"
            style={{ background: C.amber, color: "#0B0F19" }}>
            <Plus size={16} /> <span className="hidden sm:inline">Venta</span>
          </motion.button>

          <button className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <Bell size={17} style={{ color: C.sub }} />
          </button>
        </header>

        <main className="p-4 sm:p-6">{render()}</main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNav={setActive} />
      <QuickSale open={saleOpen} onClose={() => setSaleOpen(false)} toast={show} onSaved={refresh} />
      {node}
    </div>
  );
}

export default function ErpHuevos() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Ver si ya hay sesión activa al abrir
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });
    // Escuchar cambios de login/logout
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSesion(null);
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <Loader2 size={24} className="animate-spin" style={{ color: C.amber }} />
      </div>
    );
  }

  if (!sesion) return <Login onLogin={() => {}} />;
  return <AppInterna onLogout={logout} />;
}
