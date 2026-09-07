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
  products = [],
  designs = [],
  purities = [],
}) {
  const [preview, setPreview] = useState(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      productId: "",
      designId: "",
      purityId: "",
      description: "",
      image: null,
    },
  });
  const productValue = watch("productId");
  const designValue = watch("designId");
  const purityValue = watch("purityId");

  const selectedProduct = products.find((p) => String(p.id) === String(productValue));

  // Category -> Design -> Product/Item: filter designs matching product category if product has category
  const filteredDesigns = selectedProduct?.categoryId
    ? designs.filter(
        (d) => !d.categoryId || String(d.categoryId) === String(selectedProduct.categoryId)
      )
    : designs;

  // Filter purities by product metal if product has metal
  const filteredPurities = selectedProduct?.metalId
    ? purities.filter(
        (p) => !p.metalId || String(p.metalId) === String(selectedProduct.metalId)
      )
    : purities;

  useEffect(() => {
    if (open) {
      const existingImage =
        defaultValues?.imageUrl ||
        defaultValues?.image ||
        defaultValues?.photo ||
        null;
      const prodId = defaultValues?.productId ?? defaultValues?.product?.id ?? "";
      const desId = defaultValues?.designId ?? defaultValues?.design?.id ?? "";
      const purId = defaultValues?.purityId ?? defaultValues?.purity?.id ?? defaultValues?.product?.purityId ?? "";

      reset({
        name: defaultValues?.name || "",
        productId: prodId ? String(prodId) : "",
        designId: desId ? String(desId) : "",
        purityId: purId ? String(purId) : "",
        description: defaultValues?.description || "",
        image: null,
      });
      setPreview(existingImage);
      setValue("productId", prodId ? String(prodId) : "");
      setValue("designId", desId ? String(desId) : "");
      setValue("purityId", purId ? String(purId) : "");
    }
  }, [defaultValues, open, reset, setValue]);

  const handleProductChange = (val) => {
    setValue("productId", val);
    const prod = products.find((p) => String(p.id) === String(val));
    if (prod?.purityId && !purityValue) {
      setValue("purityId", String(prod.purityId));
    }
  };

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
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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
              onValueChange={handleProductChange}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} {p.category?.name ? `[${p.category.name}]` : ""}
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
                {filteredDesigns.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name} {d.category?.name ? `(${d.category.name})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm">Purity</label>
            <Select
              value={purityValue ? String(purityValue) : ""}
              onValueChange={(val) => setValue("purityId", val === "NONE" ? "" : val)}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Purity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">-- No Purity --</SelectItem>
                {filteredPurities.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} {p.metal?.name ? `(${p.metal.name})` : ""}
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
