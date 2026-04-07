import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StoreForm({ open, setOpen, onSave }) {
  const { register, handleSubmit, reset } = useForm();

  const submit = (data) => {
    onSave(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Store</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <Input placeholder="Store Name" {...register("name")} required />
          <Input placeholder="Location" {...register("location")} required />
          <Input placeholder="Address" {...register("address")} required />
          <Input placeholder="Phone" {...register("phone")} required />
          <Input placeholder="Email" type="email" {...register("email")} required />

          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}