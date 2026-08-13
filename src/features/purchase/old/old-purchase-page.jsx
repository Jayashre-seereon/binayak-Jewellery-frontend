import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DeleteModal from "../../../utils/DeleteModal";
import { notifyError, notifySuccess } from "@/utils/notify";

import OldPurchaseTable from "./old-purchase-table";
import OldPurchaseForm from "./old-purchase-form";

import {
  getOldPurchases,
  getOldPurchaseById,
  addOldPurchase,
  updateOldPurchase,
  deleteOldPurchase,
} from "../../../api/old-purchase-api";

export default function OldPurchasePage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const loadData = async () => {
    try {
      setData(await getOldPurchases());
    } catch (error) {
      notifyError(error, "Failed to load old purchases.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editData) {
        await updateOldPurchase(editData.id, formData);
        notifySuccess("Old purchase updated successfully.");
      } else {
        await addOldPurchase(formData);
        notifySuccess("Old purchase added successfully.");
      }
      setEditData(null);
      setOpen(false);
      loadData();
    } catch (error) {
      notifyError(error, "Failed to save old purchase.");
    }
  };

  const handleEdit = async (item) => {
    try {
      const purchase = await getOldPurchaseById(item.id);
      setEditData(purchase || item);
      setOpen(true);
    } catch (error) {
      notifyError(error, "Failed to load old purchase details.");
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    const selected = data.find((item) => item.id === id);
    setDeleteName(selected?.invoiceNo || selected?.customerName || `#${id}`);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOldPurchase(deleteId);
      notifySuccess("Old purchase deleted successfully.");
      setDeleteId(null);
      setDeleteName("");
      setDeleteOpen(false);
      loadData();
    } catch (error) {
      notifyError(error, "Failed to delete old purchase.");
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Old Purchase</h1>
        <Button onClick={() => setOpen(true)}>Add Old Purchase</Button>
      </div>

      <OldPurchaseTable
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <OldPurchaseForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
      />

      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Old Purchase"
        description={`Are you sure you want to delete "${deleteName}"?`}
      />
    </div>
  );
}
