import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmployeeForm({
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Employee Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col h-full">
              <div className="overflow-y-auto pr-2 space-y-4 max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm">Employee Code</label>
              <Input className="h-9" {...register("code")} />
            </div>

            <div>
              <label className="text-sm">Alias</label>
              <Input className="h-9" {...register("alias")} />
            </div>

            <div>
              <label className="text-sm">Employee Name</label>
              <Input className="h-9" {...register("name")} />
            </div>

            <div>
              <label className="text-sm">Father Name</label>
              <Input className="h-9" {...register("fatherName")} />
            </div>

            <div>
              <label className="text-sm">Date of Joining</label>
              <Input type="date" className="h-9" {...register("doj")} />
            </div>

            <div>
              <label className="text-sm">Phone</label>
              <Input className="h-9" {...register("phone")} />
            </div>

            <div>
              <label className="text-sm">Mobile</label>
              <Input className="h-9" {...register("mobile")} />
            </div>

            <div>
              <label className="text-sm">Email</label>
              <Input type="email" className="h-9" {...register("email")} />
            </div>

            <div>
              <label className="text-sm">Web Address</label>
              <Input className="h-9" {...register("website")} />
            </div>

            <div>
              <label className="text-sm">Bank Account Number</label>
              <Input className="h-9" {...register("account")} />
            </div>

            <div>
              <label className="text-sm">Bank Name</label>
              <Input className="h-9" {...register("bank")} />
            </div>

            <div>
              <label className="text-sm">Basic Salary</label>
              <Input type="number" className="h-9" {...register("basic")} />
            </div>

            <div>
              <label className="text-sm">Special Allowance</label>
              <Input type="number" className="h-9" {...register("allowance")} />
            </div>

            <div className="col-span-2">
              <label className="text-sm">Address Line 1</label>
              <Input className="h-9" {...register("address1")} />
            </div>

            <div className="col-span-2">
              <label className="text-sm">Address Line 2</label>
              <Input className="h-9" {...register("address2")} />
            </div>

          </div>
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