import { useEffect } from "react";
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

const STONE_TYPES = [
  "Diamond",
  "Gemstone",
  "Precious Stone",
  "Semi-Precious Stone",
  "Pearl",
  "Polki",
  "Kundan",
  "Ruby",
  "Emerald",
  "Sapphire",
  "Cubic Zirconia (CZ)",
  "Other",
];

const SHAPES = [
  "Round",
  "Oval",
  "Princess",
  "Pear",
  "Marquise",
  "Emerald",
  "Cushion",
  "Heart",
  "Baguette",
  "Radiant",
  "Asscher",
  "Other",
];

const CLARITIES = [
  "FL (Flawless)",
  "IF (Internally Flawless)",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
  "I1",
  "I2",
  "I3",
  "Commercial",
  "Standard",
  "NA",
];

const UNITS = ["PCS", "CT", "GMS", "MG"];

export default function StoneForm({
  open,
  setOpen,
  onSave,
  defaultValues,
}) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      stoneType: "Diamond",
      shape: "Round",
      color: "",
      clarity: "VS1",
      size: "",
      unit: "PCS",
      status: "ACTIVE",
      description: "",
    },
  });

  const stoneTypeValue = watch("stoneType");
  const shapeValue = watch("shape");
  const clarityValue = watch("clarity");
  const unitValue = watch("unit");
  const statusValue = watch("status");

  useEffect(() => {
    if (open) {
      reset({
        name: defaultValues?.name || "",
        stoneType: defaultValues?.stoneType || "Diamond",
        shape: defaultValues?.shape || "Round",
        color: defaultValues?.color || "",
        clarity: defaultValues?.clarity || "VS1",
        size: defaultValues?.size || "",
        unit: defaultValues?.unit || "PCS",
        status: defaultValues?.status || "ACTIVE",
        description: defaultValues?.description || "",
      });
    }
  }, [open, defaultValues, reset]);

  const submit = (data) => {
    onSave(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit Stone Master" : "Add Stone Master"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Stone Name *</label>
              <Input
                className="h-9 mt-1 text-xs"
                placeholder="e.g. Diamond, Ruby, Blue Sapphire"
                {...register("name", { required: true })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Stone Type</label>
              <Select
                value={stoneTypeValue || "Diamond"}
                onValueChange={(val) => setValue("stoneType", val)}
              >
                <SelectTrigger className="w-full h-9 mt-1 text-xs">
                  <SelectValue placeholder="Select Stone Type" />
                </SelectTrigger>
                <SelectContent>
                  {STONE_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Shape</label>
              <Select
                value={shapeValue || "Round"}
                onValueChange={(val) => setValue("shape", val)}
              >
                <SelectTrigger className="w-full h-9 mt-1 text-xs">
                  <SelectValue placeholder="Shape" />
                </SelectTrigger>
                <SelectContent>
                  {SHAPES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Color</label>
              <Input
                className="h-9 mt-1 text-xs"
                placeholder="e.g. G, D, Red, Blue"
                {...register("color")}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Clarity</label>
              <Select
                value={clarityValue || "VS1"}
                onValueChange={(val) => setValue("clarity", val)}
              >
                <SelectTrigger className="w-full h-9 mt-1 text-xs">
                  <SelectValue placeholder="Clarity" />
                </SelectTrigger>
                <SelectContent>
                  {CLARITIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Size</label>
              <Input
                className="h-9 mt-1 text-xs"
                placeholder="e.g. 2.5 mm, 0.05 ct"
                {...register("size")}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Unit</label>
              <Select
                value={unitValue || "PCS"}
                onValueChange={(val) => setValue("unit", val)}
              >
                <SelectTrigger className="w-full h-9 mt-1 text-xs">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u} className="text-xs">
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Status</label>
              <Select
                value={statusValue || "ACTIVE"}
                onValueChange={(val) => setValue("status", val)}
              >
                <SelectTrigger className="w-full h-9 mt-1 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
                  <SelectItem value="INACTIVE" className="text-xs">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Textarea
              className="min-h-[60px] mt-1 text-xs"
              placeholder="Stone details, origin, or specifications..."
              {...register("description")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">Save Stone</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
