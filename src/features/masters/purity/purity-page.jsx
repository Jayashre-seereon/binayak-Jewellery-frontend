import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PurityTable from "./purity-table";
import PurityForm from "./purity-form";
import {
  getPurities,
  addPurity,
  updatePurity,
  deletePurity,
} from "./purity-api";
import { getMetals } from "../metal/metal-api";

export default function PurityPage() {
  const [purities, setPurities] = useState([]);
  const [metals, setMetals] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    const purityData = await getPurities();
    const metalData = await getMetals();
    setPurities(purityData);
    setMetals(metalData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updatePurity({ ...data, id: editData.id });
    } else {
      await addPurity(data);
    }
    setEditData(null);
    loadData();
  };

  const handleEdit = (item) => {
    setEditData(item);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await deletePurity(id);
    loadData();
  };

  const filteredData = purities.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Purity Master</h1>
        <Button onClick={() => setOpen(true)}>Add New</Button>
      </div>

      <div className="mb-3">
        <Input
          placeholder="Search purity..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <PurityTable
        data={filteredData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PurityForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        metals={metals}
      />
    </div>
  );
}