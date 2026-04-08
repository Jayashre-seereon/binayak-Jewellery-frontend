import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues,
  });

  const submit = (data) => {
    onSave(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Item Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="text-sm">Alias</label>
            <Input className="h-9" {...register("alias")} />
          </div>

          <div>
            <label className="text-sm">Item Name</label>
            <Input className="h-9" {...register("name")} />
          </div>

          {/* Product Dropdown */}
          <div>
            <label className="text-sm">Product</label>
            <Select
              defaultValue={defaultValues?.product}
              onValueChange={(val) => setValue("product", val)}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.name} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Design Dropdown */}
          <div>
            <label className="text-sm">Design</label>
            <Select
              defaultValue={defaultValues?.design}
              onValueChange={(val) => setValue("design", val)}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Design" />
              </SelectTrigger>
              <SelectContent>
                {designs.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}