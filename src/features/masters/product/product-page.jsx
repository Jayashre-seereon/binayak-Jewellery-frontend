import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductTable from "./product-table";
import ProductForm from "./product-form";
import DeleteModal from "../../../utils/DeleteModal";
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/api/product-api";
import { getCategory } from "@/api/category-api";
import { getMetals } from "@/api/metal-api";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metals, setMetals] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const loadData = async () => {
    const productData = await getProducts();
    const categoryData = await getCategory();
    const metalData = await getMetals();

    setProducts(Array.isArray(productData) ? [...productData].reverse() : []);
    setCategories(categoryData);
    setMetals(metalData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateProduct(editData.id, data);
    } else {
      await addProduct(data);
    }
    setEditData(null);
    setOpen(false);
    loadData();
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    const selected = products.find((item) => item.id === id);
    setDeleteName(selected?.name || `#${id}`);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteProduct(deleteId);
    setDeleteId(null);
    setDeleteName("");
    setDeleteOpen(false);
    loadData();
  };

  const filteredData = products.filter((p) =>
    `${p.name || ""} ${p.productCode || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Product Master</h1>
        <Button onClick={() => setOpen(true)}>Add Product</Button>
      </div>

      <Input
        placeholder="Search product..."
        className="w-64 mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ProductTable
        data={filteredData}
        onEdit={async (item) => {
          const product = await getProductById(item.id);
          setEditData(product || item);
          setOpen(true);
        }}
        onDelete={handleDelete}
      />

      <ProductForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        categories={categories}
        metals={metals}
      />

      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteName}"?`}
      />
    </div>
  );
}
