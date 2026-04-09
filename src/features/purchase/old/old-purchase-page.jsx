import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import OldPurchaseTable from "./old-purchase-table";
import OldPurchaseForm from "./old-purchase-form";

import {
  getOldPurchases,
  addOldPurchase,
  deleteOldPurchase,
} from "./old-purchase-api";

export default function OldPurchasePage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    setData(await getOldPurchases());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    await addOldPurchase(formData);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Old Purchase</h1>
        <Button onClick={() => setOpen(true)}>Add Old Purchase</Button>
      </div>

      <OldPurchaseTable
        data={data}
        onDelete={async (id) => {
          await deleteOldPurchase(id);
          loadData();
        }}
      />

      <OldPurchaseForm open={open} setOpen={setOpen} onSave={handleSave} />
    </div>
  );
}