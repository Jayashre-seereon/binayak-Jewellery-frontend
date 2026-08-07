import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GradeTable from "./grade-table";
import GradeForm from "./grade-form";
import {
  getGrades,
  addGrade,
  updateGrade,
  deleteGrade,
} from "./grade-api";
import { getPurities } from "@/api/purity-api";

export default function GradePage() {
  const [grades, setGrades] = useState([]);
  const [purities, setPurities] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    const gradeData = await getGrades();
    const purityData = await getPurities();
    setGrades(gradeData);
    setPurities(purityData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateGrade({ ...data, id: editData.id });
    } else {
      await addGrade(data);
    }
    setEditData(null);
    loadData();
  };

  const handleEdit = (item) => {
    setEditData(item);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteGrade(id);
    loadData();
  };

  const filteredData = grades.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Grade Master</h1>
        <Button onClick={() => setOpen(true)}>Add New</Button>
      </div>

      <div className="mb-3">
        <Input
          placeholder="Search grade..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <GradeTable
        data={filteredData}
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
    </div>
  );
}
