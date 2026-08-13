import { Pencil, Trash ,Download} from "lucide-react";

export default function OldPurchaseTable({ data, onEdit, onDelete,onDownload }) {
  return (
    <div className="bg-white border rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Invoice No</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Customer / Party</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Payment Mode</th>
            <th className="p-3 text-left">Total Amount</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">{p.invoiceNo}</td>
              <td className="p-3">{p.purchaseType}</td>
              <td className="p-3">{p.customerName || p.party?.name || "-"}</td>
              <td className="p-3">
                {p.date ? new Date(p.date).toLocaleDateString() : "-"}
              </td>
              <td className="p-3">{p.paymentMode}</td>
              <td className="p-3">₹{Number(p.totalAmount ?? 0).toFixed(2)}</td>
             
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <Pencil
                    size={16}
                    className="text-blue-500 cursor-pointer"
                    onClick={() => onEdit(p)}
                  />
                  <Trash
                    size={16}
                    className="text-red-500 cursor-pointer"
                    onClick={() => onDelete(p.id)}
                  />
                  <Download
      size={16}
      className="text-green-500 cursor-pointer"
      onClick={() => onDownload(p.id)}
    />
                
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
