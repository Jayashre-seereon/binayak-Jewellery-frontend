import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import RateTable from "./rate-table";
import RateForm from "./rate-form";

import {
  getRates,
  addRate,
  updateRate,
  deleteRate,
} from "./rate-api";

import { getMetals } from "@/features/masters/metal/metal-api";
import { getPurities } from "@/features/masters/purity/purity-api";
import { getGrades } from "@/features/masters/grade/grade-api";

export default function RatePage() {
  const [data, setData] = useState([]);
  const [metals, setMetals] = useState([]);
  const [purities, setPurities] = useState([]);
  const [grades, setGrades] = useState([]);

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    setData(await getRates());
    setMetals(await getMetals());
    setPurities(await getPurities());
    setGrades(await getGrades());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    if (editData) {
      await updateRate({ ...formData, id: editData.id });
    } else {
      await addRate(formData);
    }
    setEditData(null);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Rate Master</h1>
        <Button onClick={() => setOpen(true)}>Add Rate</Button>
      </div>

      <RateTable
        data={data}
        onEdit={(item) => {
          setEditData(item);
          setOpen(true);
        }}
        onDelete={async (id) => {
          await deleteRate(id);
          loadData();
        }}
      />

      <RateForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        metals={metals}
        purities={purities}
        grades={grades}
      />
    </div>
  );
}