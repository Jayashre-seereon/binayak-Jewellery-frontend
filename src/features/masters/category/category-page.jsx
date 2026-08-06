import { useEffect,useState } from "react"
import { Button } from "@/components/ui/button"
import { Table } from "lucide-react"
import { Input } from "@/components/ui/input"
import CategoryTable from "./category-table"
import CategoryForm from "./category-form"

import { getCategory,addCategory,updatCategory,deleteCategory } from "./category-api"

export default function CategoryMaster()  {
  const [search, setSearch] = useState("");
  const [category,setCategory] = useState([]);
    const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);


  const loadData = async  () => {
       const data = await getCategory();
          setCategory(data);

  }

  useEffect(()=> {
    loadData();
  },[]);

  
  const handleSave = async (data) => {
      if(editData) {
        await updatCategory({ ...data, id: editData.id })
      } else {
        await addCategory(data)
      }
      setEditData(null);
    loadData();
  }

   const handleEdit = (item) => {
      setEditData(item);
      setOpen(true);
    };
  
    const handleDelete = async (id) => {
      await deleteCategory(id);
      loadData();
    };
  const filteredData = category.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.alias.toLowerCase().includes(search.toLowerCase())
  );

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
        </div>
    )
  }
   

  
