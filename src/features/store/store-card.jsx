import { useNavigate } from "react-router-dom";
import { useStoreStore } from "./storeStore";
import { Button } from "@/components/ui/button";

export default function StoreCard({ store, onEdit, onDelete, onSelect }) {
  const navigate = useNavigate();
  const setStore = useStoreStore((state) => state.setStore);

  const enterStore = () => {
    setStore(store);
    localStorage.setItem("selectedStore", JSON.stringify(store));
    localStorage.setItem("selectedStoreId", String(store.id));
    navigate("/dashboard");
  };

  return (
    <div className="p-4 border rounded-lg bg-white space-y-3">
      <h2 className="font-semibold">{store.storeName || store.name}</h2>
      <p className="text-sm text-gray-500">{store.location || store.address}</p>
      <p className="text-xs text-gray-400">ID: {store.id}</p>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onSelect || enterStore} className="bg-blue-600">
          Enter
        </Button>
        {onEdit ? (
          <Button variant="outline" onClick={() => onEdit(store)}>
            Update
          </Button>
        ) : null}
        {onDelete ? (
          <Button variant="destructive" onClick={() => onDelete(store)}>
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
}
