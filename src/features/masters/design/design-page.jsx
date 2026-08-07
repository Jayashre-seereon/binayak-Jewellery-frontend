import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DesignTable from "./design-table";
import DesignForm from "./design-form";
import DeleteModal from "@/utils/DeleteModal";
import {
  getDesigns,
  addDesign,
  updateDesign,
  getDesignById,
  deleteDesign,
} from "@/api/design-api";

export default function DesignPage() {
  const [designs, setDesigns] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const loadData = async () => {
    const data = await getDesigns();
    setDesigns(Array.isArray(data) ? [...data].reverse() : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateDesign(editData.id, data);
    } else {
      await addDesign(data);
    }
    setEditData(null);
    setOpen(false);
    loadData();
  };

  const handleEdit = async (item) => {
    const design = await getDesignById(item.id);
    setEditData(design || item);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    const selected = designs.find((item) => item.id === id);
    setDeleteName(selected?.name || `#${id}`);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteDesign(deleteId);
    setDeleteId(null);
    setDeleteName("");
    setDeleteOpen(false);
    loadData();
  };

  const filteredData = designs.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Design Master</h2>
       
      </div>

      <div className="mb-3 flex justify-between">
        <Input
          placeholder="Search design..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
         <Button
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
        >
          Add New
        </Button>
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

      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Design"
        description={`Are you sure you want to delete "${deleteName}"?`}
      />
    </div>
  );
}
