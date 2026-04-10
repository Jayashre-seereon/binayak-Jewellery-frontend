import { Pencil, Eye, Trash } from "lucide-react";

export default function AdvanceTable({ data, onEdit, onDelete }) {
  return (
    <div className="bg-white border rounded">

      <table className="w-full text-sm">

        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Contact</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Payment Mode</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((a) => (
            <tr key={a.id} className="border-t">

              <td className="p-3">{a.customer}</td>
              <td className="p-3">{a.contact}</td>
              <td className="p-3">₹{a.amount}</td>
              <td className="p-3">{a.paymentMode}</td>
              <td className="p-3">{a.date}</td>

              <td className="p-3 flex gap-3">

                <Eye size={16} className="text-gray-500 cursor-pointer" />

                <Pencil
                  size={16}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => onEdit(a)}
                />

                <Trash
                  size={16}
                  className="text-red-500 cursor-pointer"
                  onClick={() => onDelete(a.id)}
                />

              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}