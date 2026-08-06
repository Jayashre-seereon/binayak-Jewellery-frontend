import { useEffect,useState } from "react"
import { Button } from "@/components/ui/button"
import { Table } from "lucide-react"
import { Input } from "@/components/ui/input"
import CategoryTable from "./category-table"
import CategoryForm from "./category-form"
import DeleteModal from "../../../utils/DeleteModal"
import { getCategory,getCategoryById, addCategory, updateCategory, deleteCategory } 
from "@/api/category-api";

export default function CategoryMaster()  {
  const [search, setSearch] = useState("");
  const [category,setCategory] = useState([]);
    const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
const [deleteOpen, setDeleteOpen] = useState(false);
const [deleteId, setDeleteId] = useState(null);
const [deleteName, setDeleteName] = useState("");

  const loadData = async  () => {
       const data = await getCategory();
          setCategory(data);

  }

  useEffect(()=> {
    loadData();
  },[]);

  
 const handleSave = async (data) => {
  if (editData?.id) {
    await updateCategory(editData.id, data); 
  } else {
    await addCategory(data);
  }

  setEditData(null);
  setOpen(false);
  loadData();
};

  const handleEdit = async (item) => {
  try {
    const category = await getCategoryById(item.id); 
    setEditData(category);                         
    setOpen(true);
  } catch (err) {
    console.error("Failed to fetch category", err);
  }
};

  const confirmDelete = async () => {
  if (!deleteId) return;

  await deleteCategory(deleteId);

  setDeleteId(null);
  setDeleteName("");
  setDeleteOpen(false);

  loadData();
};
   const handleDelete = (item) => {
  setDeleteId(item.id);
  setDeleteName(item.name);
  setDeleteOpen(true);
};
 const filteredData = category
  .filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.alias || "").toLowerCase().includes(search.toLowerCase())
  )
  .reverse(); 

    return (
        <div>
            <div className="flex justify-between items-center mb-4 ">
                <h1 className="text-xl font-semibold"> Category Master</h1>
                <Button onClick={() => setOpen(true)}>Add New</Button>
            </div>
             <div className="mb-3">
        <Input
          placeholder="Search brand..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* category table */}
       <CategoryTable
              data={filteredData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
      {/* form */}
      <CategoryForm open={open} setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}/>

        <DeleteModal
  open={deleteOpen}
  setOpen={setDeleteOpen}
  onConfirm={confirmDelete}
  title="Delete Category"
  description={`Are you sure you want to delete "${deleteName}"?`}
/>
        </div>
    )
  }
   

  
