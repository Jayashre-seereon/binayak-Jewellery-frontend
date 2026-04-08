import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PartyTypeTable from "./party-type-table";
import PartyTypeForm from "./party-type-form";

import {
  getPartyTypes,
  addPartyType,
  updatePartyType,
  deletePartyType,
} from "./party-type-api";

export default function PartyTypePage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    const res = await getPartyTypes();
    setData(res);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    if (editData) {
      await updatePartyType({ ...formData, id: editData.id });
    } else {
      await addPartyType(formData);
    }
    setEditData(null);
    loadData();
  };

  const filtered = data.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Party Type Master</h1>
        <Button onClick={() => setOpen(true)}>Add Party Type</Button>
      </div>

      <Input
        placeholder="Search party type..."
        className="w-64 mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <PartyTypeTable
        data={filtered}
        onEdit={(item) => {
          setEditData(item);
          setOpen(true);
        }}
        onDelete={async (id) => {
          await deletePartyType(id);
          loadData();
        }}
      />

      <PartyTypeForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
      />
    </div>
  );
}