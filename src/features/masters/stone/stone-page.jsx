import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StoneTable from "./stone-table";
import StoneForm from "./stone-form";

import {
  getStones,
  addStone,
  updateStone,
  deleteStone,
} from "./stone-api";

import { getProducts } from "../product/product-api";
import { getItems } from "../item/item-api";

export default function StonePage() {
  const [stones, setStones] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    setStones(await getStones());
    setProducts(await getProducts());
    setItems(await getItems());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateStone({ ...data, id: editData.id });
    } else {
      await addStone(data);
    }
    setEditData(null);
    loadData();
  };

  const filtered = stones.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Stone Master</h1>
        <Button onClick={() => setOpen(true)}>Add Stone</Button>
      </div>

      <Input
        placeholder="Search stone..."
        className="w-64 mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <StoneTable
        data={filtered}
        onEdit={(item) => {
          setEditData(item);
          setOpen(true);
        }}
        onDelete={async (id) => {
          await deleteStone(id);
          loadData();
        }}
      />

      <StoneForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        products={products}
        items={items}
      />
    </div>
  );
}