import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StockForm({ open, setOpen, onSave }) {
  const [form, setForm] = useState({
    item: "",
    category: "",
    product: "",
    qty: 0,
    rate: 0,
    amount: 0,
  });

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };

    // 🔥 AUTO CALC
    updated.amount =
      Number(updated.qty || 0) * Number(updated.rate || 0);

    setForm(updated);
  };

  const submit = () => {
    onSave(form);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">

        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="text-xs">Item</label>
            <Input
              className="mt-1"
              onChange={(e) => handleChange("item", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs">Category</label>
            <Input
              className="mt-1"
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs">Product</label>
            <Input
              className="mt-1"
              onChange={(e) => handleChange("product", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs">Quantity</label>
            <Input
              type="number"
              className="mt-1"
              onChange={(e) => handleChange("qty", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs">Rate</label>
            <Input
              type="number"
              className="mt-1"
              onChange={(e) => handleChange("rate", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs">Amount</label>
            <Input
              value={form.amount}
              readOnly
              className="mt-1 bg-gray-100"
            />
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save</Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}