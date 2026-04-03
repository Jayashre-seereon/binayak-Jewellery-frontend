import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BrandTable from "./brand-table";
import BrandForm from "./brand-form";
import { getBrands, addBrand, updateBrand, deleteBrand } from "./brand-api";

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    const data = await getBrands();
    setBrands(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateBrand({ ...data, id: editData.id });
    } else {
      await addBrand(data);
    }
    setEditData(null);
    loadData();
  };

  const handleEdit = (item) => {
    setEditData(item);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteBrand(id);
    loadData();
  };

  // Search filter
  const filteredData = brands.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.alias.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Brand Master</h1>
        <Button onClick={() => setOpen(true)}>Add New</Button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <Input
          placeholder="Search brand..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
      />
    </div>
  );
}