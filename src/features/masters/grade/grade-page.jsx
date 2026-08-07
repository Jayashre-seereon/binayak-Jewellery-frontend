import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GradeTable from "./grade-table";
import GradeForm from "./grade-form";
import DeleteModal from "../../../utils/DeleteModal";
import {
  addGrade,
  updateGrade,
  deleteGrade,
} from "@/api/grade-api";
import http from "@/api/axios";
import { getPurities } from "@/api/purity-api";

export default function GradePage() {
  const [grades, setGrades] = useState([]);
  const [purities, setPurities] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const unwrapList = (payload) => {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.grades)) return payload.grades;
    if (Array.isArray(payload)) return payload;
    return [];
  };

  const unwrapItem = (payload) => {
    if (payload?.data && !Array.isArray(payload.data)) return payload.data;
    if (payload?.grade) return payload.grade;
    if (payload && !Array.isArray(payload)) return payload;
    return null;
  };

  const loadData = async () => {
    const gradeRes = await http.get("/api/grades/get");
    const gradeData = unwrapList(gradeRes.data);
    const purityData = await getPurities();
    setGrades(Array.isArray(gradeData) ? [...gradeData].reverse() : []);
    setPurities(purityData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateGrade(editData.id, data);
    } else {
      await addGrade(data);
    }
    setEditData(null);
    setOpen(false);
    loadData();
  };

  const handleEdit = async (item) => {
    const gradeRes = await http.get(`/api/grades/getById/${item.id}`);
    const grade = unwrapItem(gradeRes.data);
    setEditData(grade);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    const selected = grades.find((item) => item.id === id);
    setDeleteName(selected?.name || `#${id}`);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteGrade(deleteId);
    setDeleteId(null);
    setDeleteName("");
    setDeleteOpen(false);
    loadData();
  };

  const filteredData = grades.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Grade Master</h1>
        </div>

      <div className="mb-3 flex justify-between">
        <Input
          placeholder="Search grade..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setOpen(true)}>Add New</Button>
      
      </div>

      <GradeTable
        data={filteredData}
        purities={purities}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <GradeForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        purities={purities}
      />

      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Grade"
        description={`Are you sure you want to delete "${deleteName}"?`}
      />
    </div>
  );
}
