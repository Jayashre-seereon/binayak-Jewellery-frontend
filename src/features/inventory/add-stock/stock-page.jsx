import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import StockTable from "./stock-table";
import StockForm from "./stock-form";

import { getStock, addStock, deleteStock } from "./stock-api";

export default function StockPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    setData(await getStock());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    await addStock(formData);
    loadData();
  };

  return (
    <div>

      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Add Stock</h1>
        <Button onClick={() => setOpen(true)}>Add Stock</Button>
      </div>

      <StockTable
        data={data}
        onDelete={async (id) => {
          await deleteStock(id);
          loadData();
        }}
      />

      <StockForm open={open} setOpen={setOpen} onSave={handleSave} />

    </div>
  );
}