import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DesignForm({
  open,
  setOpen,
  onSave,
  defaultValues,
  categories = [],
}) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      image: null,
    },
  });

  const [preview, setPreview] = useState(null);
  const categoryValue = watch("categoryId");

  useEffect(() => {
    if (open) {
      const catId = defaultValues?.categoryId || defaultValues?.category?.id || "";
      reset({
        name: defaultValues?.name || "",
        categoryId: catId ? String(catId) : "",
        description: defaultValues?.description || "",
        image: null,
      });
      setValue("categoryId", catId ? String(catId) : "");
      setPreview(defaultValues?.image || defaultValues?.imageUrl || null);
    }
  }, [defaultValues, open, reset, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = (data) => {
    onSave(data);
    reset();
    setPreview(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Design Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="text-sm">Design Name</label>
            <Input className="h-9" {...register("name")} />
          </div>

          <div>
            <label className="text-sm">Category</label>
            <Select
              value={categoryValue ? String(categoryValue) : ""}
              onValueChange={(val) => setValue("categoryId", val === "NONE" ? "" : val)}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">-- No Category --</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm">Description</label>
            <Textarea rows={3} {...register("description")} />
          </div>

          <div>
            <label className="text-sm"> Reference Image</label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-20 h-20 object-cover border rounded"
            />
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
