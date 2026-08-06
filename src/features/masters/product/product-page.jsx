import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductTable from "./product-table";
import ProductForm from "./product-form";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "./product-api";

import { getMetals } from "@/features/masters/metal/metal-api";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metals, setMetals] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    const productData = await getProducts();
    const categoryData = await getCategory();
    const metalData = await getMetals();

    setProducts(productData);
    setCategories(categoryData);
    setMetals(metalData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateProduct({ ...data, id: editData.id });
    } else {
      await addProduct(data);
    }
    setEditData(null);
    loadData();
  };

  const filteredData = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
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
        onEdit={(item) => {
          setEditData(item);
          setOpen(true);
        }}
        onDelete={async (id) => {
          await deleteProduct(id);
          loadData();
        }}
      />

      <ProductForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        categories={categories}
        metals={metals}
      />
    </div>
  );
}