import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import AdvanceTable from "./advance-table";
import AdvanceForm from "./advance-form";

import {
  getAdvances,
  getAdvanceById,
  addAdvance,
  updateAdvance,
  deleteAdvance,
} from "../../api/advance-api";

import DeleteModal from "../../utils/DeleteModal";
import { notifyError, notifySuccess } from "@/utils/notify";

export default function AdvancePage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const result = await getAdvances();
      setData(result);
    } catch (error) {
      notifyError(
        error?.response?.data?.message ||
          "Failed to load advance receives"
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD / UPDATE
  const handleSave = async (formData) => {
    try {
      setLoading(true);

      if (editData) {
        await updateAdvance(editData.id, formData);

        notifySuccess(
          "Advance receive updated successfully"
        );
      } else {
        await addAdvance(formData);

        notifySuccess(
          "Advance receive created successfully"
        );
      }

      setEditData(null);
      setOpen(false);

      await loadData();
    } catch (error) {
      notifyError(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // EDIT - GET BY ID API
  const handleEdit = async (id) => {
    try {
      setLoading(true);

      const advance = await getAdvanceById(id);

      if (!advance) {
        notifyError("Advance receive not found");
        return;
      }

      setEditData({
        ...advance,
        date: String(advance.receiveDate || advance.date || advance.createdAt || "").slice(0, 10),
      });
      setOpen(true);
    } catch (error) {
      notifyError(
        error?.response?.data?.message ||
          "Failed to get advance receive"
      );
    } finally {
      setLoading(false);
    }
  };

  // OPEN DELETE MODAL
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  // DELETE
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setLoading(true);

      await deleteAdvance(deleteId);

      notifySuccess(
        "Advance receive deleted successfully"
      );

      setDeleteOpen(false);
      setDeleteId(null);

      await loadData();
    } catch (error) {
      notifyError(
        error?.response?.data?.message ||
          "Failed to delete advance receive"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">
          Advance Receive
        </h1>

        <Button
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
        >
          Add Advance
        </Button>
      </div>

      {/* TABLE */}
      <AdvanceTable
        data={data}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* FORM */}
      <AdvanceForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
      />

      {/* DELETE MODAL */}
      <DeleteModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Advance Receive"
        description="Are you sure you want to delete this advance receive?"
      />
    </div>
  );
}