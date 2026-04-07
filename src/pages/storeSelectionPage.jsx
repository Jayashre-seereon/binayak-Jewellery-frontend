import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getStores, addStore } from "@/features/store/store-api";
import { useAuthStore } from "@/auth/authStore";
import StoreForm from "@/features/store/store-form";

export default function StoreSelectionPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await getStores();
        setStores(data);
      } catch (error) {
        console.error("Failed to load stores:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const handleStoreSelect = (store) => {
    // Store the selected store in localStorage for the session
    localStorage.setItem("selectedStore", JSON.stringify(store));
    navigate("/dashboard");
  };

  const handleSave = async (data) => {
    await addStore(data);
    loadData(); // Refresh the stores list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="max-w-4xl w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Store</h1>
          <p className="text-gray-600">Welcome, {user?.username}! Please select a store to manage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{store.name}</h3>
                    <p className="text-sm text-gray-600">{store.address}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Phone:</span> {store.phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Email:</span> {store.email}
                    </p>
                  </div>

                  <Button 
                    onClick={() => handleStoreSelect(store)}
                    className="w-full"
                  >
                    Enter Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button onClick={() => setOpen(true)} variant="outline">
            Add New Store
          </Button>
        </div>

        <StoreForm open={open} setOpen={setOpen} onSave={handleSave} />

        {stores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No stores available. Please add a store first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
