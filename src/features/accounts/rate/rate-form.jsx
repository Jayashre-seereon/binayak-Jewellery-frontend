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

export default function RateForm({
  open,
  setOpen,
  onSave,
  defaultValues,
  metals,
  purities,
  grades,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Rate Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col h-full">

          <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[65vh] pr-2">

            {/* Metal */}
            <div>
              <label className="text-sm">Metal</label>
              <Select
                defaultValue={defaultValues?.metal}
                onValueChange={(val) => setValue("metal", val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Metal" />
                </SelectTrigger>
                <SelectContent>
                  {metals.map((m) => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purity */}
            <div>
              <label className="text-sm">Purity</label>
              <Select
                defaultValue={defaultValues?.purity}
                onValueChange={(val) => setValue("purity", val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Purity" />
                </SelectTrigger>
                <SelectContent>
                  {purities.map((p) => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade */}
            <div>
              <label className="text-sm">Grade</label>
              <Select
                defaultValue={defaultValues?.grade}
                onValueChange={(val) => setValue("grade", val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.name} value={g.name}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unit */}
            <div>
              <label className="text-sm">Unit</label>
              <Select
                defaultValue={defaultValues?.unit}
                onValueChange={(val) => setValue("unit", val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gram">Gram</SelectItem>
                  <SelectItem value="Kg">Kg</SelectItem>
                  <SelectItem value="Piece">Piece</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rates */}
            <div>
              <label className="text-sm">Sale Rate</label>
              <Input type="number" className="h-9" {...register("saleRate")} />
            </div>

            <div>
              <label className="text-sm">Exchange Rate</label>
              <Input type="number" className="h-9" {...register("exchangeRate")} />
            </div>

            <div>
              <label className="text-sm">Cash Rate</label>
              <Input type="number" className="h-9" {...register("cashRate")} />
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
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