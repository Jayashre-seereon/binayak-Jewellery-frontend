import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import VoucherForm from "../shared/voucher-form";
import VoucherTable from "../shared/voucher-table";

import {
  getVouchers,
  addVoucher,
  deleteVoucher,
} from "../shared/voucher-api";

export default function JournalPage() {

  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setData(await getVouchers());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>

      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Journal Entry</h1>
        <Button onClick={()=>setOpen(true)}>Add</Button>
      </div>

      <VoucherTable
        data={data}
        onDelete={async(id)=>{
          await deleteVoucher(id);
          load();
        }}
      />

      <VoucherForm
        open={open}
        setOpen={setOpen}
        onSave={async(data)=>{
          await addVoucher(data);
          load();
        }}
        title="Journal Entry"
      />

    </div>
  );
}