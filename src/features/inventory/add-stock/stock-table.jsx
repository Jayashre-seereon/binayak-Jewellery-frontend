import { Trash } from "lucide-react";

export default function StockTable({ data, onDelete }) {
  return (
    <div className="bg-white border rounded">

      <table className="w-full text-sm">

        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Item</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Qty</th>
            <th className="p-3 text-left">Rate</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-3">{s.item}</td>
              <td className="p-3">{s.category}</td>
              <td className="p-3">{s.product}</td>
              <td className="p-3">{s.qty}</td>
              <td className="p-3">{s.rate}</td>
              <td className="p-3">{s.amount}</td>

              <td className="p-3">
                <Trash
                  size={16}
                  className="text-red-500 cursor-pointer"
                  onClick={() => onDelete(s.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}