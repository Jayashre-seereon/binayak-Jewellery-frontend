import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ItemForm({
  open,
  setOpen,
  onSave,
  defaultValues,
  products,
  designs,
}) {
  const [preview, setPreview] = useState(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      productId: "",
      designId: "",
      description: "",
      image: null,
    },
  });
  const productValue = watch("productId");
  const designValue = watch("designId");

  useEffect(() => {
    if (open) {
      reset({
        name: defaultValues?.name || "",
        productId:
          defaultValues?.productId ||
          defaultValues?.product?.id ||
          "",
        designId:
          defaultValues?.designId ||
          defaultValues?.design?.id ||
          "",
        description: defaultValues?.description || "",
        image: null,
      });
      setPreview(defaultValues?.image || defaultValues?.imageUrl || null);
      setValue(
        "productId",
        defaultValues?.productId || defaultValues?.product?.id || ""
      );
      setValue(
        "designId",
        defaultValues?.designId || defaultValues?.design?.id || ""
      );
    }
  }, [defaultValues, open, reset, setValue]);

  const submit = (data) => {
    onSave(data);
    reset();
    setPreview(null);
    setOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Item Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="text-sm">Item Name</label>
           <Input
  className="h-9"
  {...register("name", { required: "Item name is required" })}
/> </div>

          <div>
            <label className="text-sm">Product</label>
            <Select
              value={String(productValue || "")}
              onValueChange={(val) => setValue("productId", val)}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm">Design</label>
            <Select
              value={String(designValue || "")}
              onValueChange={(val) => setValue("designId", val)}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Design" />
              </SelectTrigger>
              <SelectContent>
                {designs.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm">Description</label>
  <Textarea
  className="min-h-[80px]"
  {...register("description")}
/>        
          </div>

          <div>
            <label className="text-sm">Image</label>
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
