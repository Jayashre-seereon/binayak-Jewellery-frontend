import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function StoreForm({ open, setOpen, onSave, initialValues }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
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
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="space-y-1">
            <Input
              label="Store Name"
              placeholder="Store Name"
              {...register("storeName", {
                required: "Store name is required",
                minLength: {
                  value: 2,
                  message: "Store name must be at least 2 characters",
                },
              })}
              aria-invalid={Boolean(errors.storeName)}
            />
            {errors.storeName ? (
              <p className="text-xs text-red-500">{errors.storeName.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <Input
              label="Location"
              placeholder="Location"
              {...register("location", {
                required: "Location is required",
                minLength: {
                  value: 2,
                  message: "Location must be at least 2 characters",
                },
              })}
              aria-invalid={Boolean(errors.location)}
            />
            {errors.location ? (
              <p className="text-xs text-red-500">{errors.location.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <Input
              label="Email"
              placeholder="Email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            ) : null}
          </div>


          <Button type="submit" className="w-full">
            {initialValues ? "Update" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
