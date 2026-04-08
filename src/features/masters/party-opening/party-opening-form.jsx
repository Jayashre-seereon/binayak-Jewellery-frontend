import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function PartyOpeningForm({
  open,
  setOpen,
  onSave,
  defaultValues,
  parties,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Party Opening Balance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col h-full">

          <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[65vh] pr-2">

            {/* Party */}
            <div>
              <label className="text-sm">Party</label>
              <Select
                defaultValue={defaultValues?.party}
                onValueChange={(val) => setValue("party", val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Party" />
                </SelectTrigger>
                <SelectContent>
                  {parties.map((p) => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            {/* Type */}
            <div>
              <label className="text-sm">Opening Type</label>
              <Select
                defaultValue={defaultValues?.type}
                onValueChange={(val) => setValue("type", val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Debit / Credit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Financial Year */}
            <div>
              <label className="text-sm">Financial Year</label>
              <Input className="h-9" {...register("year")} />
            </div>

            {/* Debit */}
            <div>
              <label className="text-sm">Debit Weight</label>
              <Input type="number" className="h-9" {...register("debitWeight")} />
            </div>

            {/* Credit */}
            <div>
              <label className="text-sm">Credit Weight</label>
              <Input type="number" className="h-9" {...register("creditWeight")} />
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