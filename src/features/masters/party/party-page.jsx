import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PartyTable from "./party-table";
import PartyForm from "./party-form";

import {
  getParties,
  addParty,
  updateParty,
  deleteParty,
} from "./party-api";

import { getPartyTypes } from "@/features/masters/party-type/party-type-api";

export default function PartyPage() {
  const [data, setData] = useState([]);
  const [partyTypes, setPartyTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    setData(await getParties());
    setPartyTypes(await getPartyTypes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    if (editData) {
      await updateParty({ ...formData, id: editData.id });
    } else {
      await addParty(formData);
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
        <h1 className="text-xl font-semibold">Party Master</h1>
        <Button onClick={() => setOpen(true)}>Add Party</Button>
      </div>

      <Input
        placeholder="Search party..."
        className="w-64 mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <PartyTable
        data={filtered}
        onEdit={(item) => {
          setEditData(item);
          setOpen(true);
        }}
        onDelete={async (id) => {
          await deleteParty(id);
          loadData();
        }}
      />

      <PartyForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        partyTypes={partyTypes}
      />
    </div>
  );
}