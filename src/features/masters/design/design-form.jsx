import { useEffect, useState } from "react";
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
import { Plus, Trash2 } from "lucide-react";

export default function DesignForm({
  open,
  setOpen,
  onSave,
  defaultValues,
  products = [],
  stoneOptions = [],
}) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      productId: "",
      description: "",
      image: null,
    },
  });

  const [preview, setPreview] = useState(null);
  const [designStones, setDesignStones] = useState([]);

  const productValue = watch("productId");

  useEffect(() => {
    if (open) {
      const prodId = defaultValues?.productId ?? defaultValues?.product?.id ?? "";
      reset({
        name: defaultValues?.name || "",
        productId: prodId ? String(prodId) : "",
        description: defaultValues?.description || "",
        image: null,
      });
      setPreview(defaultValues?.image || defaultValues?.imageUrl || null);

      // Load existing design stones
      const rawStones = defaultValues?.designStones || defaultValues?.stones || [];
      if (Array.isArray(rawStones) && rawStones.length > 0) {
        setDesignStones(
          rawStones.map((s) => ({
            stoneId: s.stoneId ? String(s.stoneId) : (s.id ? String(s.id) : ""),
            pieces: s.pieces !== undefined ? Number(s.pieces) : 1,
            expectedWeight: s.expectedWeight !== undefined ? Number(s.expectedWeight) : 0,
            unit: s.unit || "ct",
          }))
        );
      } else {
        setDesignStones([]);
      }
    }
  }, [defaultValues, open, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const addStoneRow = () => {
    setDesignStones((prev) => [
      ...prev,
      {
        stoneId: stoneOptions[0]?.id ? String(stoneOptions[0].id) : "",
        pieces: 1,
        expectedWeight: 0,
        unit: "ct",
      },
    ]);
  };

  const updateStoneRow = (index, field, value) => {
    setDesignStones((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const removeStoneRow = (index) => {
    setDesignStones((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = (data) => {
    const validStones = designStones
      .filter((s) => Boolean(s.stoneId))
      .map((s) => ({
        stoneId: Number(s.stoneId),
        pieces: Math.max(1, parseInt(s.pieces) || 1),
        expectedWeight: parseFloat(s.expectedWeight) || 0,
        unit: s.unit || "ct",
      }));

    onSave({
      ...data,
      stones: validStones,
    });
    reset();
    setPreview(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit Design Master" : "Add Design Master"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Design Name *</label>
              <Input
                className="h-9 mt-1 text-xs"
                placeholder="e.g. Floral Gold Necklace"
                {...register("name", { required: true })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Product</label>
              <Select
                value={String(productValue || "")}
                onValueChange={(val) => setValue("productId", val)}
              >
                <SelectTrigger className="w-full h-9 mt-1 text-xs">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE" className="text-xs">-- None / General --</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* STONE CONFIGURATION SECTION */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Stone Configuration
                </h4>
                <p className="text-[11px] text-slate-500">
                  Configure default stones for this design (Expected Pcs & Weight)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStoneRow}
                className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Plus size={13} /> Add Stone
              </Button>
            </div>

            {designStones.length === 0 ? (
              <div className="text-center py-4 bg-white rounded border border-dashed text-slate-400 text-xs">
                No stones configured for this design yet. Click "+ Add Stone" if this design contains stones.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2 text-left min-w-[150px]">Stone</th>
                      <th className="p-2 text-right w-20">Pcs</th>
                      <th className="p-2 text-right min-w-[100px]">Expected Wt</th>
                      <th className="p-2 text-center w-24">Unit</th>
                      <th className="p-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {designStones.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="p-2">
                          <Select
                            value={String(row.stoneId || "")}
                            onValueChange={(val) => updateStoneRow(idx, "stoneId", val)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Select Stone" />
                            </SelectTrigger>
                            <SelectContent>
                              {stoneOptions.map((st) => (
                                <SelectItem key={st.id} value={String(st.id)} className="text-xs">
                                  {st.name} {st.shape ? `(${st.shape})` : ""} {st.clarity ? `[${st.clarity}]` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            value={row.pieces}
                            onChange={(e) => updateStoneRow(idx, "pieces", e.target.value)}
                            className="h-7 text-right text-xs"
                          />
                        </td>

                        <td className="p-2">
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            value={row.expectedWeight}
                            onChange={(e) => updateStoneRow(idx, "expectedWeight", e.target.value)}
                            className="h-7 text-right text-xs font-medium"
                            placeholder="0.00"
                          />
                        </td>

                        <td className="p-2">
                          <select
                            value={row.unit || "ct"}
                            onChange={(e) => updateStoneRow(idx, "unit", e.target.value)}
                            className="h-7 text-xs rounded border border-slate-200 bg-white px-2 w-full"
                          >
                            <option value="ct">ct (carat)</option>
                            <option value="PCS">PCS</option>
                            <option value="gm">gm</option>
                            <option value="mg">mg</option>
                          </select>
                        </td>

                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeStoneRow(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Textarea rows={2} className="text-xs mt-1" {...register("description")} />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Reference Image</label>
            <Input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 text-xs" />
          </div>

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-16 h-16 object-cover border rounded"
            />
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">Save Design</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

