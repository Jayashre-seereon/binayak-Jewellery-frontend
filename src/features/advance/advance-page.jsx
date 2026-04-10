import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import AdvanceTable from "./advance-table";
import AdvanceForm from "./advance-form";

import {
  getAdvances,
  addAdvance,
  updateAdvance,
  deleteAdvance,
} from "./advance-api";

export default function AdvancePage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    setData(await getAdvances());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    if (editData) {
      await updateAdvance({ ...formData, id: editData.id });
    } else {
      await addAdvance(formData);
    }
    setEditData(null);
    loadData();
  };

  return (
    <div>

      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Advance Receive</h1>
        <Button onClick={() => setOpen(true)}>Add Advance</Button>
      </div>

      <AdvanceTable
        data={data}
        onEdit={(item) => {
          setEditData(item);
          setOpen(true);
        }}
        onDelete={async (id) => {
          await deleteAdvance(id);
          loadData();
        }}
      />

      <AdvanceForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
      />

    </div>
  );
}