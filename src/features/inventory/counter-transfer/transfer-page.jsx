import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import TransferTable from "./transfer-table";
import TransferForm from "./transfer-form";

import {
  getTransfers,
  addTransfer,
  deleteTransfer,
} from "./transfer-api";

export default function TransferPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    setData(await getTransfers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    await addTransfer(formData);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Counter Transfer</h1>
        <Button onClick={() => setOpen(true)}>Add Transfer</Button>
      </div>

      <TransferTable
        data={data}
        onDelete={async (id) => {
          await deleteTransfer(id);
          loadData();
        }}
      />

      <TransferForm open={open} setOpen={setOpen} onSave={handleSave} />
    </div>
  );
}