import { Pencil, Trash } from "lucide-react";

export default function RateTable({ data, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Metal</th>
            <th className="p-3 text-left">Purity</th>
            <th className="p-3 text-left">Grade</th>
            <th className="p-3 text-left">Unit</th>
            <th className="p-3 text-left">Sale</th>
            <th className="p-3 text-left">Exchange</th>
            <th className="p-3 text-left">Cash</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{item.metal}</td>
              <td className="p-3">{item.purity}</td>
              <td className="p-3">{item.grade}</td>
              <td className="p-3">{item.unit}</td>
              <td className="p-3">{item.saleRate}</td>
              <td className="p-3">{item.exchangeRate}</td>
              <td className="p-3">{item.cashRate}</td>

              <td className="p-3">
                <div className="flex gap-2">
                  <Pencil size={16} className="text-blue-500 cursor-pointer" onClick={() => onEdit(item)} />
                  <Trash size={16} className="text-red-500 cursor-pointer" onClick={() => onDelete(item.id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}