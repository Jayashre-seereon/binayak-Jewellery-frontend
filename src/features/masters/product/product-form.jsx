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

export default function ProductForm({
  open,
  setOpen,
  onSave,
  defaultValues,
  categories,
  metals,
}) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      metalId: "",
      image: null,
    },
  });
  const [preview, setPreview] = useState(null);
  const categoryValue = watch("categoryId");
  const metalValue = watch("metalId");

  useEffect(() => {
    if (open) {
      reset({
        name: defaultValues?.name || "",
        description: defaultValues?.description || "",
        categoryId:
          defaultValues?.categoryId ||
          defaultValues?.category?.id ||
          "",
        metalId: defaultValues?.metalId || defaultValues?.metal?.id || "",
        image: null,
      });
      setPreview(defaultValues?.image || defaultValues?.imageUrl || null);
      setValue(
        "categoryId",
        defaultValues?.categoryId || defaultValues?.category?.id || ""
      );
      setValue("metalId", defaultValues?.metalId || defaultValues?.metal?.id || "");
    }
  }, [defaultValues, open, reset, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = (data) => {
    onSave(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Product Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="text-sm">Product Name</label>
            <Input className="h-9" {...register("name")} />
          </div>

          <div>
            <label className="text-sm">Category</label>
            <Select
              value={String(categoryValue || "")}
              onValueChange={(value) => setValue("categoryId", value)}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm">Metal</label>
            <Select
              value={String(metalValue || "")}
              onValueChange={(value) => setValue("metalId", value)}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Metal" />
              </SelectTrigger>
              <SelectContent>
                {metals.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm">Reference Image</label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-20 h-20 object-cover border rounded"
            />
          )}

          <div>
            <label className="text-sm">Description</label>
            <Textarea rows={3} {...register("description")} />
          </div>

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
