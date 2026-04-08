import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ItemTable from "./item-table";
import ItemForm from "./item-form";
import {
  getItems,
  addItem,
  updateItem,
  deleteItem,
} from "./item-api";

import { getProducts } from "../product/product-api";
import { getDesigns } from "@/features/masters/design/design-api";

export default function ItemPage() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [designs, setDesigns] = useState([]);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    setItems(await getItems());
    setProducts(await getProducts());
    setDesigns(await getDesigns());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateItem({ ...data, id: editData.id });
    } else {
      await addItem(data);
    }
    setEditData(null);
    loadData();
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Item Master</h1>
        <Button onClick={() => setOpen(true)}>Add Item</Button>
      </div>

      <Input
        placeholder="Search item..."
        className="w-64 mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ItemTable
        data={filtered}
        onEdit={(item) => {
          setEditData(item);
          setOpen(true);
        }}
        onDelete={async (id) => {
          await deleteItem(id);
          loadData();
        }}
      />

      <ItemForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        products={products}
        designs={designs}
      />
    </div>
  );
}