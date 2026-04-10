import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import SalesTable from "./sales-estimate-table";
import SalesForm from "./sale-estimate-form";

import {
  getSales,
  addSales,
  updateSales,
  deleteSales,
} from "./sale-estimate-api";

export default function SalesPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    setData(await getSales());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    if (editData) {
      await updateSales({ ...formData, id: editData.id });
    } else {
      await addSales(formData);
    }
    setEditData(null);
    loadData();
  };

  return (
    <div>

      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Sales</h1>
        <Button onClick={() => setOpen(true)}>Add Sale</Button>
      </div>

      <SalesTable
        data={data}
        onEdit={(item) => {
          setEditData(item);
          setOpen(true);
        }}
        onDelete={async (id) => {
          await deleteSales(id);
          loadData();
        }}
      />

      <SalesForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
      />

    </div>
  );
}