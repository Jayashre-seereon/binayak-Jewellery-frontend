import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const METAL_OPTIONS = ["Gold", "Silver", "Platinum"];
const PRODUCT_OPTIONS = ["Ring", "Chain", "Bangle", "Earring", "Pendant"];
const PAYMENT_MODES = ["Cash", "Card", "UPI", "Bank Transfer"];

let rowCounter = 1;

function createRow() {
  return {
    id: rowCounter++,
    metal: "",
    product: "",
    grossWt: "",
    stoneWt: "",
    netWt: 0,
    purity: 91.6,
    dustWt: "",
    rate: "",
    metalAmt: 0,
    stoneAmt: "",
    total: 0,
    narration: "",
  };
}

function calcRow(row) {
  const grossWt = parseFloat(row.grossWt) || 0;
  const stoneWt = parseFloat(row.stoneWt) || 0;
  const purity = parseFloat(row.purity) || 0;
  const rate = parseFloat(row.rate) || 0;
  const stoneAmt = parseFloat(row.stoneAmt) || 0;

  const netWt = grossWt - stoneWt;
  const metalAmt = netWt * (purity / 100) * rate;
  const total = metalAmt + stoneAmt;

  return { ...row, netWt, metalAmt, total };
}

export default function OldPurchaseForm({ open, setOpen, onSave }) {
  const [form, setForm] = useState({
    employee: "",
    customer: "",
    address: "",
    voucher: "OP-8042",
    date: new Date().toISOString().split("T")[0],
    paymentMode: "Cash",
    paySpec: "",
    payValue: "",
  });

  const [items, setItems] = useState([createRow()]);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addRow = () => setItems((prev) => [...prev, createRow()]);

  const deleteRow = (id) =>
    setItems((prev) => prev.filter((r) => r.id !== id));

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === id ? calcRow({ ...row, [field]: value }) : row
      )
    );
  };

  const totalGross = items.reduce((s, r) => s + (parseFloat(r.grossWt) || 0), 0);
  const totalNet = items.reduce((s, r) => s + (r.netWt || 0), 0);
  const totalPure = items.reduce(
    (s, r) => s + r.netWt * ((parseFloat(r.purity) || 0) / 100),
    0
  );
  const totalAmount = items.reduce((s, r) => s + (r.total || 0), 0);

  const handleSave = () => {
    if (!form.customer.trim()) {
      alert("Customer Name is required.");
      return;
    }
    onSave?.({ ...form, items, totalAmount });
    setOpen(false);
  };

  const selectCls =
    "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const thCls = "px-2 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap";
  const tdCls = "px-1 py-1 align-middle";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!w-[95vw] !max-w-[1300px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Old Purchase</DialogTitle>
        </DialogHeader>

        {/* ── HEADER FIELDS ── */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Employee</label>
              <select
                className={selectCls}
                value={form.employee}
                onChange={(e) => updateForm("employee", e.target.value)}
              >
                <option value="">Select</option>
                <option>Ramesh</option>
                <option>Suresh</option>
                <option>Priya</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Customer Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.customer}
                onChange={(e) => updateForm("customer", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Address</label>
              <Input
                value={form.address}
                onChange={(e) => updateForm("address", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Voucher No.</label>
              <Input value={form.voucher} readOnly className="bg-muted text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => updateForm("date", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── ITEMS ── */}
        <div className="border rounded-lg mt-2">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-medium text-sm">Items</h2>
            <Button size="sm" onClick={addRow}>+ Add</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 960 }}>
              <thead>
                <tr className="border-b">
                  <th className={thCls}>Metal</th>
                  <th className={thCls}>Product</th>
                  <th className={thCls}>Gross Wt</th>
                  <th className={thCls}>Stone Wt</th>
                  <th className={thCls}>Net Wt</th>
                  <th className={thCls}>Purity %</th>
                  <th className={thCls}>Dust Wt</th>
                  <th className={thCls}>Rate</th>
                  <th className={thCls}>Metal Amt</th>
                  <th className={thCls}>Stone Amt</th>
                  <th className={thCls}>Total</th>
                  <th className={thCls}>Narration</th>
                  <th className={thCls}></th>
                </tr>
              </thead>

              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className={tdCls}>
                      <select
                        className={selectCls + " h-8"}
                        value={row.metal}
                        onChange={(e) => updateItem(row.id, "metal", e.target.value)}
                      >
                        <option value="">-</option>
                        {METAL_OPTIONS.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </td>

                    <td className={tdCls}>
                      <select
                        className={selectCls + " h-8"}
                        value={row.product}
                        onChange={(e) => updateItem(row.id, "product", e.target.value)}
                      >
                        <option value="">-</option>
                        {PRODUCT_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </td>

                    <td className={tdCls}>
                      <Input className="h-8 w-24" type="number" step="0.001"
                        value={row.grossWt}
                        onChange={(e) => updateItem(row.id, "grossWt", e.target.value)} />
                    </td>

                    <td className={tdCls}>
                      <Input className="h-8 w-24" type="number" step="0.001"
                        value={row.stoneWt}
                        onChange={(e) => updateItem(row.id, "stoneWt", e.target.value)} />
                    </td>

                    <td className={tdCls + " text-sm font-medium px-3"}>
                      {row.netWt.toFixed(3)}
                    </td>

                    <td className={tdCls}>
                      <Input className="h-8 w-20" type="number" step="0.01"
                        value={row.purity}
                        onChange={(e) => updateItem(row.id, "purity", e.target.value)} />
                    </td>

                    <td className={tdCls}>
                      <Input className="h-8 w-20" type="number" step="0.001"
                        value={row.dustWt}
                        onChange={(e) => updateItem(row.id, "dustWt", e.target.value)} />
                    </td>

                    <td className={tdCls}>
                      <Input className="h-8 w-24" type="number" step="1"
                        value={row.rate}
                        onChange={(e) => updateItem(row.id, "rate", e.target.value)} />
                    </td>

                    <td className={tdCls + " text-sm font-medium px-3 whitespace-nowrap"}>
                      ₹{row.metalAmt.toFixed(2)}
                    </td>

                    <td className={tdCls}>
                      <Input className="h-8 w-24" type="number" step="0.01"
                        value={row.stoneAmt}
                        onChange={(e) => updateItem(row.id, "stoneAmt", e.target.value)} />
                    </td>

                    <td className={tdCls + " text-sm font-medium px-3 whitespace-nowrap"}>
                      ₹{row.total.toFixed(2)}
                    </td>

                    <td className={tdCls}>
                      <Input className="h-8 w-28"
                        value={row.narration}
                        onChange={(e) => updateItem(row.id, "narration", e.target.value)} />
                    </td>

                    <td className={tdCls}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteRow(row.id)}
                      >
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PAYMENT + SUMMARY ── */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm">Payment</h3>
            <div className="flex gap-2">
              <select
                className={selectCls + "flex-shrink-0"}
                value={form.paymentMode}
                onChange={(e) => updateForm("paymentMode", e.target.value)}
              >
                {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
              <Input
                placeholder="Specification"
                value={form.paySpec}
                onChange={(e) => updateForm("paySpec", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Value"
                className=""
                value={form.payValue}
                onChange={(e) => updateForm("payValue", e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-1">
            {[
              { label: "Total Gross Wt", value: `${totalGross.toFixed(3)} gm` },
              { label: "Total Net Wt",   value: `${totalNet.toFixed(3)} gm` },
              { label: "Total Pure Wt",  value: `${totalPure.toFixed(3)} gm` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{label}</span>
                <span>{value}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-sm border-t pt-2 mt-1">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}