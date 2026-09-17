import { Pencil, Trash } from "lucide-react";

export default function DesignTable({ data, onEdit, onDelete }) {
  const formatStonesSummary = (item) => {
    const stones = item?.designStones || item?.stones || [];
    if (!stones || stones.length === 0) return "-";

    return (
      <div className="flex flex-wrap gap-1">
        {stones.map((st, i) => {
          const name = st.stone?.name || st.stoneName || st.name || "Stone";
          const pcs = st.pieces || 1;
          const wt = st.expectedWeight !== undefined ? st.expectedWeight : st.weight;
          const unit = st.unit || "ct";
          return (
            <span
              key={st.id || i}
              className="inline-flex items-center text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium"
            >
              {name}: {pcs} pcs {wt > 0 ? `(${wt} ${unit})` : ""}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 border-b text-slate-700 font-semibold">
          <tr>
            <th className="p-2.5 text-center w-12">SL No</th>
            <th className="p-2.5 text-center w-16">Image</th>
            <th className="p-2.5 text-left min-w-[140px]">Design Name</th>
            <th className="p-2.5 text-left min-w-[120px]">Product</th>
            <th className="p-2.5 text-left min-w-[200px]">Configured Stones</th>
            <th className="p-2.5 text-left min-w-[140px]">Description</th>
            <th className="p-2.5 text-center w-20">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 text-slate-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center p-6 text-slate-400">
                No designs found. Click "Add New" to create a design master.
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                <td className="p-2.5 text-center font-medium text-slate-400">{index + 1}</td>

                <td className="p-2.5 text-center">
                  {item.image || item.imageUrl ? (
                    <img
                      src={item.image || item.imageUrl}
                      alt="design"
                      className="w-10 h-10 object-cover rounded border mx-auto"
                    />
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                <td className="p-2.5 font-bold text-slate-900">{item.name}</td>
                <td className="p-2.5 font-medium text-slate-700">
                  {item.product?.name ? (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                      {item.product.name}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>

                <td className="p-2.5">{formatStonesSummary(item)}</td>

                <td className="p-2.5 text-slate-500 truncate max-w-[200px]" title={item.description || ""}>
                  {item.description || "-"}
                </td>

                <td className="p-2.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-1 hover:bg-slate-100 rounded text-blue-600 transition"
                      title="Edit"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="p-1 hover:bg-red-50 rounded text-red-500 transition"
                      title="Delete"
                      onClick={() => onDelete(item.id)}
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
