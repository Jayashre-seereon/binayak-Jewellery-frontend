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

export default function PurityForm({
  open,
  setOpen,
  onSave,
  defaultValues,
  metals,
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
          <DialogTitle>Purity Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
  <div>
    <label className="text-sm">Alias</label>
    <Input className="w-full" {...register("alias")} />
  </div>

  <div>
    <label className="text-sm">Purity Name</label>
    <Input className="w-full" {...register("name")} />
  </div>

  <div>
    <label className="text-sm">Metal</label>
    <Select onValueChange={(value) => setValue("metal", value)}>
      <SelectTrigger className="w-full">
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

  <div>
    <label className="text-sm">Description</label>
    <Textarea className="w-full" rows={3} {...register("description")} />
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