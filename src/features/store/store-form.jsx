import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function StoreForm({ open, setOpen, onSave, initialValues }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialValues || {
      storeName: "",
      location: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    reset(
      initialValues || {
        storeName: "",
        location: "",
        email: "",
        password: "",
      }
    );
  }, [initialValues, reset]);

  const submit = (data) => {
    onSave(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{initialValues ? "Update Store" : "Add Store"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <Input placeholder="Store Name" {...register("storeName")} required />
          <Input placeholder="Location" {...register("location")} required />
          <Input placeholder="Email" type="email" {...register("email")} required />
          <Input
            placeholder="Password"
            type="password"
            {...register("password")}
            required={!initialValues}
          />

          <Button type="submit" className="w-full">
            {initialValues ? "Update" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
