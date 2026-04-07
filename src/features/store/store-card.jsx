import { useNavigate } from "react-router-dom";

export default function StoreCard({ store }) {
  const navigate = useNavigate();

  const enterStore = () => {
    localStorage.setItem("selectedStore", JSON.stringify(store));
    navigate("/dashboard");
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h2 className="font-semibold">{store.name}</h2>
      <p className="text-sm text-gray-500">{store.location || store.address}</p>

      <button
        onClick={enterStore}
        className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
      >
        Enter
      </button>
    </div>
  );
}