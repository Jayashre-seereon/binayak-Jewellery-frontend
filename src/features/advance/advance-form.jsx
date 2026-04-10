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
import { useEffect } from "react";

export default function AdvanceForm({
  open,
  setOpen,
  onSave,
  defaultValues,
}) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  const submit = (data) => {
    onSave(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">

        <DialogHeader>
          <DialogTitle>Advance Receive</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-2 gap-4">

          {/* Customer */}
          <div>
            <label className="text-xs">Customer Name *</label>
            <Input {...register("customer")} className="mt-1" />
          </div>

          {/* Contact */}
          <div>
            <label className="text-xs">Contact Number</label>
            <Input {...register("contact")} className="mt-1" />
          </div>

          {/* Address */}
          <div className="col-span-2">
            <label className="text-xs">Address</label>
            <Textarea {...register("address")} className="mt-1" />
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs">Amount *</label>
            <Input type="number" {...register("amount")} className="mt-1" />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="text-xs">Payment Mode</label>
            <select
              {...register("paymentMode")}
              className="w-full border h-10 rounded mt-1 px-2"
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {/* Specification */}
          <div className="col-span-2">
            <label className="text-xs">Specification</label>
            <Textarea {...register("specification")} className="mt-1" />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs">Date</label>
            <Input type="date" {...register("date")} className="mt-1" />
          </div>

          {/* FOOTER */}
          <div className="col-span-2 flex justify-end gap-2 mt-4">
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