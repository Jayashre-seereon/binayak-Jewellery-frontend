import { Pencil, Trash } from "lucide-react";

export default function StoneTable({ data, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Alias</th>
            <th className="p-3 text-left">Stone Name</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Item</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{item.id}</td>
              <td className="p-3">{item.alias}</td>
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.product}</td>
              <td className="p-3">{item.item}</td>

              <td className="p-3">
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Pencil
                      size={16}
                      className="text-blue-500"
                      onClick={() => onEdit(item)}
                    />
                  </button>

                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Trash
                      size={16}
                      className="text-red-500"
                      onClick={() => onDelete(item.id)}
                    />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}