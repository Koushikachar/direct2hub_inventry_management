import SubmitButton from "@/components/SubmitButton";
import { randomUUID } from "crypto";
import { Shell, Stat } from "@/components/Shell"; import { Err, Panel, Table, inp, btn, ghost } from "@/components/ui";
import { db } from "@/lib/db"; import { ctx } from "@/lib/ctx"; import { usage } from "@/lib/plan"; import { addWarehouse, setDefaultWarehouse, transferStock } from "@/app/actions";
export const dynamic = "force-dynamic";
export default async function Warehouses({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const c = await ctx(), { e, ok } = await searchParams, canStock = ["OWNER", "INVENTORY_MANAGER"].includes(c.role);
  const [ws, sums, products, transfers, u] = await Promise.all([
    db.warehouse.findMany({ where: { orgId: c.orgId }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] }),
    db.stockBalance.groupBy({ by: ["warehouseId"], where: { orgId: c.orgId }, _sum: { sellable: true, reserved: true, damaged: true } }),
    db.product.findMany({ where: { orgId: c.orgId, archived: false }, orderBy: { name: "asc" }, take: 500, select: { id: true, sku: true, name: true } }),
    db.stockTransfer.findMany({ where: { orgId: c.orgId }, orderBy: { number: "desc" }, take: 25 }), usage(c.orgId)]);
  const sum = new Map<string, { sellable: number | null; reserved: number | null; damaged: number | null }>(sums.map((s) => [s.warehouseId, s._sum] as [string, { sellable: number | null; reserved: number | null; damaged: number | null }])), wn = new Map<string, string>(ws.map((w) => [w.id, w.name] as [string, string])), pn = new Map<string, string>(products.map((p) => [p.id, `${p.name} (${p.sku})`] as [string, string]));
  const def = ws[0]?.id, extra = await db.product.findMany({ where: { id: { in: transfers.map((t) => t.productId).filter((x) => !pn.has(x)) } }, select: { id: true, sku: true, name: true } });
  extra.forEach((p) => pn.set(p.id, `${p.name} (${p.sku})`));
  return <Shell title="Warehouses"><Err e={e} />{ok && <p role="status" className="glass px-4 py-2 text-sm text-brand">{ok}</p>}
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3"><Stat label="Locations" value={`${u.locationCount} / ${u.locations}`} hint={`${u.label} plan`} /><Stat label="Default warehouse" value={ws.find((w) => w.id === def)?.name ?? "—"} hint="New orders and receipts use it" /></div>
    <Table head={["Warehouse", "Sellable", "Reserved", "Damaged", ""]} empty="No warehouses." rows={ws.map((w) => { const s = sum.get(w.id);
      return [<span key="n" className="font-semibold">{w.name}{w.id === def && <span className="ml-2 rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">Default</span>}</span>, s?.sellable ?? 0, s?.reserved ?? 0, s?.damaged ?? 0,
        w.id !== def && c.role === "OWNER" ? <form key="d" action={setDefaultWarehouse}><input type="hidden" name="id" value={w.id} /><SubmitButton className={`${ghost} px-3 py-1`}>Make default</SubmitButton></form> : ""]; })} />
    {canStock && <Panel title="Add a warehouse"><form action={addWarehouse} className="flex flex-wrap items-end gap-3"><label className="text-sm">Name<input name="name" required maxLength={60} placeholder="Mumbai godown" className={inp} /></label><button className={btn} disabled={u.locationCount >= u.locations}>Add warehouse</button>
      {u.locationCount >= u.locations && <a href="/subscription" className="text-sm text-brand underline">Your plan allows {u.locations}. Upgrade for more</a>}</form></Panel>}
    {canStock && ws.length > 1 && <Panel title="Transfer stock between warehouses"><form action={transferStock} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input type="hidden" name="key" value={randomUUID()} />
      <label className="text-sm sm:col-span-2">Product<select name="productId" required className={inp}>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></label>
      <label className="text-sm">From<select name="fromId" defaultValue={ws[0]?.id} className={inp}>{ws.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
      <label className="text-sm">To<select name="toId" defaultValue={ws[1]?.id} className={inp}>{ws.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
      <label className="text-sm">Quantity<input name="qty" type="number" min={1} step={1} required className={inp} /></label><label className="text-sm sm:col-span-2">Note (optional)<input name="note" maxLength={200} className={inp} /></label>
      <div className="self-end"><SubmitButton className={btn}>Transfer</SubmitButton></div></form>
      <p className="mt-2 text-xs text-ink/60">Only available stock can move; units reserved for confirmed orders stay put. Orders, receipts and returns work on the default warehouse, so transfer stock there before selling it.</p></Panel>}
    <h2 className="font-semibold">Recent transfers</h2>
    <Table head={["#", "Date", "Product", "From", "To", "Qty", "Note"]} empty="No transfers yet." rows={transfers.map((t) => [`TO-${String(t.number).padStart(4, "0")}`, t.createdAt.toLocaleDateString("en-IN"), pn.get(t.productId) ?? "—", wn.get(t.fromId) ?? "—", wn.get(t.toId) ?? "—", t.qty, t.note ?? "—"])} /></Shell>;
}
