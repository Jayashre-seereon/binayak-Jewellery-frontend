import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import StoreCard from "./store-card";
import StoreForm from "./store-form";
import { getStores, addStore } from "./store-api";

export default function StorePage() {
  const [stores, setStores] = useState([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    const data = await getStores();
    setStores(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    await addStore(data);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Stores</h1>
        <Button onClick={() => setOpen(true)}>Add Store</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      <StoreForm open={open} setOpen={setOpen} onSave={handleSave} />
    </div>
  );
}