import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmployeeTable from "./employee-table";
import EmployeeForm from "./employee-form";

import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "./employee-api";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const loadData = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateEmployee({ ...data, id: editData.id });
    } else {
      await addEmployee(data);
    }
    setEditData(null);
    loadData();
  };

  const filteredData = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Employee Master</h1>
        <Button onClick={() => setOpen(true)}>Add Employee</Button>
      </div>

      <Input
        placeholder="Search employee..."
        className="w-64 mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <EmployeeTable
        data={filteredData}
        onEdit={(item) => {
          setEditData(item);
          setOpen(true);
        }}
        onDelete={async (id) => {
          await deleteEmployee(id);
          loadData();
        }}
      />

      <EmployeeForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
      />
    </div>
  );
}