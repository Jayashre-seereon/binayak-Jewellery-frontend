import { Pencil, Trash } from "lucide-react";

export default function StoneTable({ data, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg border overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 border-b text-slate-700 font-semibold">
          <tr>
            <th className="p-2.5 text-center w-12">S.No</th>
            <th className="p-2.5 text-left min-w-[120px]">Stone Name</th>
            <th className="p-2.5 text-left min-w-[100px]">Type</th>
            <th className="p-2.5 text-left min-w-[80px]">Shape</th>
            <th className="p-2.5 text-left min-w-[70px]">Color</th>
            <th className="p-2.5 text-left min-w-[80px]">Clarity</th>
            <th className="p-2.5 text-left min-w-[70px]">Size</th>
            <th className="p-2.5 text-center min-w-[60px]">Unit</th>
            <th className="p-2.5 text-center min-w-[80px]">Status</th>
            <th className="p-2.5 text-left min-w-[140px]">Description</th>
            <th className="p-2.5 text-center w-20">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 text-slate-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={11} className="p-6 text-center text-slate-400">
                No stones found. Click "Add Stone" to create your first stone master.
              </td>
            </tr>
          ) : (
            data.map((stone, index) => (
              <tr key={stone.id} className="hover:bg-slate-50 transition">
                <td className="p-2.5 text-center font-medium text-slate-400">{index + 1}</td>
                <td className="p-2.5 font-bold text-slate-900">{stone.name}</td>
                <td className="p-2.5 text-slate-600">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-200">
                    {stone.stoneType || "Diamond"}
                  </span>
                </td>
                <td className="p-2.5 text-slate-700 font-medium">{stone.shape || "-"}</td>
                <td className="p-2.5 text-slate-700">{stone.color || "-"}</td>
                <td className="p-2.5 text-slate-700">{stone.clarity || "-"}</td>
                <td className="p-2.5 text-slate-700 font-mono text-[11px]">{stone.size || "-"}</td>
                <td className="p-2.5 text-center font-semibold text-slate-600">{stone.unit || "PCS"}</td>
                <td className="p-2.5 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      stone.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {stone.status || "ACTIVE"}
                  </span>
                </td>
                <td className="p-2.5 text-slate-500 truncate max-w-[200px]" title={stone.description || ""}>
                  {stone.description || "-"}
                </td>

                <td className="p-2.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-1 hover:bg-slate-100 rounded text-blue-600 transition"
                      title="Edit"
                      onClick={() => onEdit(stone)}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      className="p-1 hover:bg-red-50 rounded text-red-500 transition"
                      title="Delete"
                      onClick={() => onDelete(stone.id)}
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

