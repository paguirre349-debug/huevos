import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, Boxes, Egg, Users, Truck,
  Package, Wallet, FileBarChart, Target, Sparkles, Settings,
  Search, Plus, Bell, TrendingUp, TrendingDown, Command,
  ChevronRight, Trash2, Loader2, Pencil,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, CartesianGrid,
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
  const [form, setForm] = useState({ product_id: "", cantidad: 1, metodo_pago: "efectivo", observaciones: "" });

  useEffect(() => {
    if (!open) return;
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
    setForm({ product_id: prod.id, cantidad: 1, metodo_pago: "efectivo", observaciones: "" });
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

function Dashboard({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: sales } = await supabase.from("sales").select("*");
      const { data: items } = await supabase.from("sale_items").select("*");
      const all = sales || [];
      const hoy = new Date().toDateString();
      const ventasHoy = all.filter((s) => new Date(s.fecha).toDateString() === hoy);
      const facturacionHoy = ventasHoy.reduce((a, s) => a + Number(s.total || 0), 0);
      const gananciaHoy = ventasHoy.reduce((a, s) => a + Number(s.ganancia || 0), 0);
      const unidadesHoy = (items || []).filter((it) => {
        const s = all.find((x) => x.id === it.sale_id);
        return s && new Date(s.fecha).toDateString() === hoy;
      }).reduce((a, it) => a + Number(it.cantidad || 0), 0);
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const key = d.toDateString();
        const dia = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d.getDay()];
        const total = all.filter((s) => new Date(s.fecha).toDateString() === key)
          .reduce((a, s) => a + Number(s.total || 0), 0);
        return { name: dia, ventas: total };
      });
      const metodos = {};
      all.forEach((s) => { metodos[s.metodo_pago] = (metodos[s.metodo_pago] || 0) + 1; });
      const totalV = all.length || 1;
      const colorMap = { efectivo: C.green, transferencia: C.blue, mercadopago: C.amber };
      const metodoPago = Object.entries(metodos).map(([name, v]) => ({
        name, value: Math.round((v / totalV) * 100), color: colorMap[name] || C.sub,
      }));
      setStats({ facturacionHoy, gananciaHoy, unidadesHoy, totalVentas: all.length, last7, metodoPago });
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
  return (
    <div className="space-y-5">
      {noData && (
        <Card className="p-4" style={{ borderColor: C.amber }}>
          <div className="text-sm" style={{ color: C.text }}>
            👋 Todavía no cargaste ventas. Los números están en cero porque ahora son reales.
            Cargá tu primer producto en <b style={{ color: C.amber }}>Productos</b> y después una venta con <b style={{ color: C.amber }}>+ Venta</b>.
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat i={0} icon={Egg} label="Huevos vendidos hoy" value={stats.unidadesHoy.toLocaleString("es-AR")} color={C.amber} />
        <Stat i={1} icon={Wallet} label="Facturación hoy" value={money(stats.facturacionHoy)} color={C.green} />
        <Stat i={2} icon={TrendingUp} label="Ganancia hoy" value={money(stats.gananciaHoy)} color={C.blue} />
        <Stat i={3} icon={ShoppingCart} label="Ventas totales" value={stats.totalVentas.toLocaleString("es-AR")} color={C.amber} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" style={{ gridColumn: "span 2" }}>
          <Card className="p-5">
            <h3 className="font-semibold mb-4" style={{ color: C.text }}>Ventas últimos 7 días</h3>
            <ResponsiveContainer width="100%" height={240}>
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
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={stats.metodoPago} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
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

export default function ErpHuevos() {
  const [active, setActive] = useState("dashboard");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { show, node } = useToast();
  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen((v) => !v); }
      if (e.key === "Escape") { setCmdOpen(false); setSaleOpen(false); }
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
      default: return <Placeholder label={nav.find((n) => n.key === active)?.label} />;
    }
  };

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }} className="flex">
      <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col p-4" style={{ borderRight: `1px solid ${C.border}` }}>
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
              <button key={n.key} onClick={() => setActive(n.key)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all relative"
                style={{ background: on ? `${C.amber}14` : "transparent", color: on ? C.text : C.sub }}>
                {on && <motion.span layoutId="active-bar" className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full" style={{ background: C.amber }} />}
                <n.icon size={17} style={{ color: on ? C.amber : C.sub }} />{n.label}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 px-2 pt-4 mt-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm" style={{ background: `${C.blue}33`, color: C.blue }}>P</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Patricio</div>
            <div className="text-[11px] truncate" style={{ color: C.sub }}>Dueño</div>
          </div>
          <Settings size={16} style={{ color: C.sub }} />
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center gap-4"
          style={{ background: "rgba(11,15,25,0.8)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h1 className="font-bold text-lg leading-tight">Hola Patricio 👋</h1>
            <p className="text-xs capitalize" style={{ color: C.sub }}>{today}</p>
          </div>
          <button onClick={() => setCmdOpen(true)}
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-64 transition hover:brightness-125"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.sub }}>
            <Search size={15} /><span className="flex-1 text-left">Buscar…</span>
            <kbd className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.border }}><Command size={10} />K</kbd>
          </button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSaleOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: C.amber, color: "#0B0F19" }}>
            <Plus size={16} /> Venta
          </motion.button>
          <button className="relative w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <Bell size={17} style={{ color: C.sub }} />
          </button>
        </header>
        <main className="p-6">{render()}</main>
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNav={setActive} />
      <QuickSale open={saleOpen} onClose={() => setSaleOpen(false)} toast={show} onSaved={refresh} />
      {node}
    </div>
  );
}
