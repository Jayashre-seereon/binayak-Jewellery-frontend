import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import PartyOpeningTable from "./party-opening-table";
import PartyOpeningForm from "./party-opening-form";

import {
  getOpenings,
  addOpening,
  updateOpening,
  deleteOpening,
} from "./party-opening-api";

import { getParties } from "@/api/party-api";
import { getMetals } from "@/features/masters/metal/metal-api";

export default function PartyOpeningPage() {
  const [data, setData] = useState([]);
  const [parties, setParties] = useState([]);
  const [metals, setMetals] = useState([]);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    setData(await getOpenings());
    setParties(await getParties());
    setMetals(await getMetals());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    if (editData) {
      await updateOpening({ ...formData, id: editData.id });
    } else {
      await addOpening(formData);
    }
    setEditData(null);
    loadData();
  };

  const filtered = data.filter((d) =>
    d.party.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Party Opening Balance</h1>
        <Button onClick={() => setOpen(true)}>Add Opening</Button>
      </div>

      <Input
        placeholder="Search party..."
        className="w-64 mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <PartyOpeningTable
        data={filtered}
        onEdit={(item) => {
          setEditData(item);
          setOpen(true);
        }}
        onDelete={async (id) => {
          await deleteOpening(id);
          loadData();
        }}
      />

      <PartyOpeningForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        parties={parties}
        metals={metals}
      />
    </div>
  );
}