import { Trash } from "lucide-react";

export default function TransferTable({ data, onDelete }) {
  return (
    <div className="bg-white border rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Voucher</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">From</th>
            <th className="p-3 text-left">To</th>
            <th className="p-3 text-left">Items</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="p-3">{t.voucher}</td>
              <td className="p-3">{t.product}</td>
              <td className="p-3">{t.fromCounter}</td>
              <td className="p-3">{t.toCounter}</td>
              <td className="p-3">{t.items.length}</td>

              <td className="p-3">
                <Trash
                  size={16}
                  className="text-red-500 cursor-pointer"
                  onClick={() => onDelete(t.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}