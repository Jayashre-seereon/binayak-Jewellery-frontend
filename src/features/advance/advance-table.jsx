import { Pencil, Trash } from "lucide-react";
import { money } from "@/utils/units";

const STATUS_STYLES = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PARTIALLY_ADJUSTED: "bg-amber-50 text-amber-700 border-amber-200",
  FULLY_ADJUSTED: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_LABELS = {
  AVAILABLE: "Available",
  PARTIALLY_ADJUSTED: "Partially Adjusted",
  FULLY_ADJUSTED: "Fully Adjusted",
};

function resolveStatus(row) {
  if (row.status) return row.status;
  const balance = Number(row.balanceAmount ?? Number(row.amount || 0) - Number(row.adjustedAmount || 0));
  const adjusted = Number(row.adjustedAmount || 0);
  if (balance <= 0.01) return "FULLY_ADJUSTED";
  if (adjusted > 0) return "PARTIALLY_ADJUSTED";
  return "AVAILABLE";
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-IN");
}

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
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((a) => {
            const status = resolveStatus(a);
            return (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.customerName}</td>
                <td className="p-3">{a.contactNumber || "-"}</td>
                <td className="p-3">₹{money(a.amount)}</td>
                <td className="p-3">{a.paymentMode}</td>
                <td className="p-3">{formatDate(a.receiveDate || a.date || a.createdAt)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status] || STATUS_STYLES.AVAILABLE}`}>
                    {STATUS_LABELS[status] || status}
                  </span>
                </td>
                <td className="p-3 flex gap-3">
                  {status === "FULLY_ADJUSTED" ? (
                    <span className="text-[11px] font-semibold text-slate-400">
                      <Pencil
                      size={16}
                      className="text-blue-500 cursor-pointer"
                    
                    />
                    </span>
                  ) : (
                    <Pencil
                      size={16}
                      className="text-blue-500 cursor-pointer"
                      onClick={() => onEdit(a.id)}
                    />
                  )}
                  <Trash
                    size={16}
                    className={`${
                      status === "FULLY_ADJUSTED"
                        ? "text-red-300 cursor-not-allowed"
                        : "text-red-500 cursor-pointer"
                    }`}
                    onClick={() => {
                      if (status === "FULLY_ADJUSTED") return;
                      onDelete(a.id);
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
