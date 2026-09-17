import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DesignTable from "./design-table";
import DesignForm from "./design-form";
import DeleteModal from "@/utils/DeleteModal";
import { notifyError, notifySuccess } from "@/utils/notify";
import {
  getDesigns,
  addDesign,
  updateDesign,
  getDesignById,
  deleteDesign,
} from "@/api/design-api";
import { getProducts } from "@/api/product-api";
import { getStones } from "@/api/stone-api";

export default function DesignPage() {
  const [designs, setDesigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [stones, setStones] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const loadData = async () => {
    try {
      const [designsData, productsData, stonesData] = await Promise.all([
        getDesigns().catch(() => []),
        getProducts().catch(() => []),
        getStones().catch(() => []),
      ]);
      setDesigns(Array.isArray(designsData) ? [...designsData].reverse() : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setStones(Array.isArray(stonesData) ? stonesData : []);
    } catch (error) {
      notifyError(error, "Failed to load designs.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    try {
      if (editData) {
        await updateDesign(editData.id, data);
        notifySuccess("Design updated successfully.");
      } else {
        await addDesign(data);
        notifySuccess("Design added successfully.");
      }
      setEditData(null);
      setOpen(false);
      loadData();
    } catch (error) {
      notifyError(error, "Design save failed.");
    }
  };

  const handleEdit = async (item) => {
    try {
      const design = await getDesignById(item.id);
      setEditData(design || item);
      setOpen(true);
    } catch (error) {
      notifyError(error, "Failed to load design details.");
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    const selected = designs.find((item) => item.id === id);
    setDeleteName(selected?.name || `#${id}`);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDesign(deleteId);
      notifySuccess("Design deleted successfully.");
      setDeleteId(null);
      setDeleteName("");
      setDeleteOpen(false);
      loadData();
    } catch (error) {
      notifyError(error, "Failed to delete design.");
    }
  };

  const filteredData = designs.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div >
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
        products={products}
        stoneOptions={stones}
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
