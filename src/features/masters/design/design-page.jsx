import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DesignTable from "./design-table";
import DesignForm from "./design-form";
import {
  getDesigns,
  addDesign,
  updateDesign,
  deleteDesign,
} from "./design-api";

export default function DesignPage() {
  const [designs, setDesigns] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    const data = await getDesigns();
    setDesigns(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateDesign({ ...data, id: editData.id });
    } else {
      await addDesign(data);
    }
    setEditData(null);
    loadData();
  };

  const handleEdit = (item) => {
    setEditData(item);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteDesign(id);
    loadData();
  };

  const filteredData = designs.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Design Master</h1>
        <Button onClick={() => setOpen(true)}>Add New</Button>
      </div>

      <div className="mb-3">
        <Input
          placeholder="Search design..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DesignTable
        data={filteredData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DesignForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
      />
    </div>
  );
}