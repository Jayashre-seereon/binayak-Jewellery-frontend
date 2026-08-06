import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MetalTable from "./metal-table";
import MetalForm from "./metal-form";
import DeleteModal from "../../../utils/DeleteModal";
import {
  getMetals,
  getMetalById,
  addMetal,
  updateMetal,
  deleteMetal,
} from "@/api/metal-api";

export default function MetalPage() {
  const [metals, setMetals] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
const [deleteId, setDeleteId] = useState(null);
const [deleteName, setDeleteName] = useState("");
  const loadData = async () => {
    const data = await getMetals();
    setMetals(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
    await updateMetal(editData.id, data);
    } else {
      await addMetal(data);
    }
    setEditData(null);
    loadData();
  };

 const handleEdit = async (item) => {
  try {
    const metal = await getMetalById(item.id); 
    setEditData(metal);                        
    setOpen(true);                            
  } catch (err) {
    console.error("Failed to fetch metal", err);
  }
};

const handleDelete = (item) => {
  setDeleteId(item.id);
  setDeleteName(item.name);
  setDeleteOpen(true);
};
const confirmDelete = async () => {
  if (!deleteId) return;

  await deleteMetal(deleteId);

  setDeleteId(null);
  setDeleteName("");
  setDeleteOpen(false);

  loadData();
};
  const filteredData = metals.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.alias.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Metal Master</h1>
        <Button onClick={() => setOpen(true)}>Add New</Button>
      </div>

      <div className="mb-3">
        <Input
          placeholder="Search metal..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <MetalTable
        data={filteredData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <MetalForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
      />
      <DeleteModal
  open={deleteOpen}
  setOpen={setDeleteOpen}
  onConfirm={confirmDelete}
  title="Delete Metal"
  description={`Are you sure you want to delete "${deleteName}"?`}
/>
    </div>
  );
}