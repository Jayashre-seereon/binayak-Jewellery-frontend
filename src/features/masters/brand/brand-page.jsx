import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BrandTable from "./brand-table";
import BrandForm from "./brand-form";
import DeleteModal from "../../../utils/DeleteModal";
import { getBrands, getBrandById, addBrand, updateBrand, deleteBrand } from "../../../api/brand-api";
export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteName, setDeleteName] = useState("");
  const [deleteId, setDeleteId] = useState(null);
 const loadData = async () => {
  const data = await getBrands();
  setBrands(data);
};

  useEffect(() => {
    loadData();
  }, []);

const handleSave = async (data) => {
  try {
    if (editData?.id) {
      await updateBrand(editData.id, data);
    } else {
      await addBrand(data);
    }

    setEditData(null);
    setOpen(false);
    loadData();
  } catch (err) {
    console.error("Save failed", err);
  }
};

  const handleEdit = async (item) => {
    const brand = await getBrandById(item.id);
    setEditData(brand);
    setOpen(true);
  };
const confirmDelete = async () => {
  if (!deleteId) return;

  await deleteBrand(deleteId);

  setDeleteId(null);
  setDeleteName("");   // ✅ reset name
  setDeleteOpen(false);

  loadData();
};
const handleDelete = (item) => {
  setDeleteId(item.id);
  setDeleteName(item.name); // ✅ store name
  setDeleteOpen(true);
};

  // Search filter
const filteredData = brands
  .filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.alias || "").toLowerCase().includes(search.toLowerCase())
  )
  .reverse(); 
  
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Brand Master</h1>
     
      </div>

      {/* Search */}
      <div className="mb-3 flex justify-between ">
        <Input
          placeholder="Search brand..."
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

      {/* Table */}
      <BrandTable
        data={filteredData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form */}
      <BrandForm
        open={open}
        setOpen={(value) => {
          setOpen(value);
          if (!value) setEditData(null);
        }}
        onSave={handleSave}
        defaultValues={editData}
      />
      <DeleteModal
  open={deleteOpen}
  setOpen={setDeleteOpen}
  onConfirm={confirmDelete}
  title="Delete Brand"
 description={`Are you sure you want to delete "${deleteName}"?`}/>
    </div>
  );
}