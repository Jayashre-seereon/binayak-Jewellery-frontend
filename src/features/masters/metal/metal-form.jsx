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

export default function MetalForm({
  open,
  setOpen,
  onSave,
  defaultValues,
}) {
  const { register, handleSubmit, reset } = useForm({ defaultValues });

  const submit = (data) => {
    onSave(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Metal Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <Input placeholder="Alias" {...register("alias")} />
          <Input placeholder="Metal Name" {...register("name")} />
          <Textarea placeholder="Description" {...register("description")} />

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