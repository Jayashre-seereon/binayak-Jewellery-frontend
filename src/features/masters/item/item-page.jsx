import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ItemTable from "./item-table";
import ItemForm from "./item-form";
import DeleteModal from "@/utils/DeleteModal";
import { notifyError, notifySuccess } from "@/utils/notify";
import {
  getItems,
  addItem,
  updateItem,
  deleteItem,
} from "./item-api";

import { getProducts } from "@/api/product-api";
import { getDesigns } from "@/api/design-api";

export default function ItemPage() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [designs, setDesigns] = useState([]);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const loadData = async () => {
    try {
      setItems(await getItems());
      setProducts(await getProducts());
      setDesigns(await getDesigns());
    } catch (error) {
      notifyError(error, "Failed to load items.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    try {
      if (editData) {
        await updateItem({ ...data, id: editData.id });
        notifySuccess("Item updated successfully.");
      } else {
        await addItem(data);
        notifySuccess("Item added successfully.");
      }
      setEditData(null);
      setOpen(false);
      loadData();
    } catch (error) {
      notifyError(error, "Item save failed.");
    }
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (item) => {
    setDeleteId(item.id);
    setDeleteName(item.name);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteItem(deleteId);
      notifySuccess("Item deleted successfully.");
      setDeleteId(null);
      setDeleteName("");
      setDeleteOpen(false);
      loadData();
    } catch (error) {
      notifyError(error, "Failed to delete item.");
    }
  };

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
        onDelete={handleDelete}
      />

      <ItemForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        products={products}
        designs={designs}
      />

      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${deleteName}"?`}
      />
    </div>
  );
}
