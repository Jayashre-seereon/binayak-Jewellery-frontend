import { useNavigate } from "react-router-dom";
import { useStoreStore } from "./storeStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export default function StoreCard({ store, onEdit, onDelete, onSelect }) {
  const navigate = useNavigate();
  const setStore = useStoreStore((state) => state.setStore);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        ) : null}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {store.storeName || store.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                onDelete(store);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
