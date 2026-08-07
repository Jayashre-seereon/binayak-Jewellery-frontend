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

export default function GradeForm({
  open,
  setOpen,
  onSave,
  defaultValues,
  purities,
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
          <DialogTitle>Grade Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
         
          <div>
            <label className="text-sm">Grade Name</label>
            <Input className="h-9" {...register("name")} />
          </div>

          <div>
            <label className="text-sm">Purity</label>
            <Select
              defaultValue={defaultValues?.purity}
              onValueChange={(value) => setValue("purity", value)}
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

          <div>
            <label className="text-sm">Percentage</label>
            <Input type="number" className="h-9" {...register("percentage")} />
          </div>

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