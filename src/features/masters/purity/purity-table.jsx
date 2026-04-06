import { Pencil, Trash } from "lucide-react";

export default function PurityTable({ data, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Alias</th>
            <th className="p-3 text-left">Purity Name</th>
            <th className="p-3 text-left">Metal</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-3">{item.id}</td>
              <td className="p-3">{item.alias}</td>
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.metal}</td>
              <td className="p-3">{item.description}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Pencil
                    size={16}
                    className="text-blue-500 cursor-pointer"
                    onClick={() => onEdit(item)}
                  />
                  <Trash
                    size={16}
                    className="text-red-500 cursor-pointer"
                    onClick={() => onDelete(item.id)}
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