import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TransferForm({ open, setOpen, onSave }) {
  const [form, setForm] = useState({
    product: "",
    fromCounter: "",
    toCounter: "",
    voucher: "CT-3006",
    date: "",
  });

  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState([]);

  // ADD ITEM BY BARCODE
  const addItem = () => {
    if (!barcode) return;

    setItems([
      ...items,
      {
        barcode,
        item: "Sample Item",
        grossWt: 10,
        netWt: 9,
        mrp: 5000,
        pcs: 1,
      },
    ]);

    setBarcode("");
  };

  const submit = () => {
    onSave({ ...form, items });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!w-[95vw] !max-w-[1200px] p-0">

        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Counter Transfer</DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="p-6 space-y-6">

          {/* SECTION 1 */}
          <div className="grid grid-cols-3 gap-4 border p-4 rounded">

            <div>
              <label className="text-xs">Product</label>
              <select className="w-full border h-10 rounded mt-1 px-2">
                <option>Gold Necklace</option>
              </select>
            </div>

            <div>
              <label className="text-xs">From Counter *</label>
              <select className="w-full border h-10 rounded mt-1 px-2">
                <option>Select</option>
                <option>A</option>
                <option>B</option>
              </select>
            </div>

            <div>
              <label className="text-xs">To Counter *</label>
              <select className="w-full border h-10 rounded mt-1 px-2">
                <option>Select</option>
                <option>A</option>
                <option>B</option>
              </select>
            </div>

            <div>
              <label className="text-xs">Voucher No.</label>
              <Input value={form.voucher} readOnly className="mt-1" />
            </div>

            <div>
              <label className="text-xs">Date</label>
              <Input type="date" className="mt-1" />
            </div>

            <div>
              <label className="text-xs">Scan Barcode</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Barcode..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
                <Button onClick={addItem}>+</Button>
              </div>
            </div>

          </div>

          {/* TABLE */}
          <div className="border rounded">

            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Barcode</th>
                  <th className="p-3 text-left">Item Name</th>
                  <th className="p-3 text-left">Gross Wt</th>
                  <th className="p-3 text-left">Net Wt</th>
                  <th className="p-3 text-left">MRP Value</th>
                  <th className="p-3 text-left">Pieces</th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-400">
                      Scan barcodes to add items
                    </td>
                  </tr>
                ) : (
                  items.map((i, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{i.barcode}</td>
                      <td className="p-3">{i.item}</td>
                      <td className="p-3">{i.grossWt}</td>
                      <td className="p-3">{i.netWt}</td>
                      <td className="p-3">{i.mrp}</td>
                      <td className="p-3">{i.pcs}</td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>

          </div>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Transfer</Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}