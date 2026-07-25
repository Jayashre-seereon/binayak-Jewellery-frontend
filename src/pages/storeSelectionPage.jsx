import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { createStore, deleteStore, getStoreById, getStores, updateStore } from "@/api/store-api";
import StoreCard from "@/features/store/store-card";
import StoreForm from "@/features/store/store-form";
import { toast } from "sonner";

export default function StoreSelectionPage() {
  const navigate = useNavigate();
  const { user, setSelectedStore } = useAuthStore();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const role = useAuthStore((state) => state.role);

  const loadStores = async () => {
    setLoading(true);
    try {
      const response = await getStores();
      const data = response.data?.stores || response.data?.data?.stores || [];
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load stores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (role && role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, role]);

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    localStorage.setItem("selectedStoreId", String(store.id));
    toast.success(`Entered ${store.storeName || store.name || "store"}.`);
    navigate("/dashboard", { replace: false });
  };

  const handleCreate = async (data) => {
    try {
      await createStore(data);
      toast.success("Store created successfully.");
      await loadStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create store.");
    }
  };

  const handleUpdate = async (data) => {
    if (!editingStore?.id) return;

    try {
      await updateStore(editingStore.id, data);
      toast.success("Store updated successfully.");
      setEditingStore(null);
      await loadStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update store.");
    }
  };

  const handleDelete = async (store) => {
    try {
      await deleteStore(store.id);
      toast.success("Store deleted successfully.");
      await loadStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete store.");
    }
  };

  const handleEdit = async (store) => {
    try {
      const response = await getStoreById(store.id);
      const data = response.data?.store || response.data?.data || response.data || store;
      setEditingStore({ ...data, password: "" });
      setFormOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load store details.");
    }
  };

  const handleSave = async (data) => {
    if (editingStore?.id) {
      await handleUpdate(data);
      return;
    }
    await handleCreate(data);
  };

  const selectedStoreId = useMemo(
    () => localStorage.getItem("selectedStoreId"),
    []
  );

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="max-w-4xl w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Store</h1>
          <p className="text-gray-600">
            Welcome, {user?.name || user?.email || "Admin"}! Please select a store to manage.
          </p>
          {selectedStoreId ? (
            <p className="text-sm text-gray-500 mt-2">Current store ID: {selectedStoreId}</p>
          ) : null}
        </div>
        <div className="flex justify-end mb-4 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditingStore(null);
              setFormOpen(true);
            }}
          >
            Create Store
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-600">Loading stores...</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onSelect={() => handleStoreSelect(store)}
                onEdit={() => handleEdit(store)}
                onDelete={() => handleDelete(store)}
              />
            ))}
          </div>
        )}

        {!loading && stores.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="p-6 text-center text-gray-600">
              No stores available. Create one to continue.
            </CardContent>
          </Card>
        ) : null}

        <StoreForm
          open={formOpen}
          setOpen={(open) => {
            setFormOpen(open);
            if (!open) setEditingStore(null);
          }}
          onSave={handleSave}
          initialValues={editingStore}
        />
      </div>
    </div>
  );
}
