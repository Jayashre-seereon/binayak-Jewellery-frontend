import { PencilLine, Printer, Trash2 } from "lucide-react";

const ALLOWED_NEXT_STATUSES = {
  AVAILABLE: ["RESERVED", "SOLD", "MELTED", "REFINED", "DAMAGED"],
  RESERVED: ["AVAILABLE", "SOLD"],
  PENDING: [],
  SOLD: [],
  MELTED: ["AVAILABLE"],
  REFINED: ["AVAILABLE"],
  DAMAGED: ["AVAILABLE"],
};

const label = (value) => {
  if (!value) return "-";
  if (typeof value === "object") {
    return (
      value.name ||
      value.purchaseItemCode ||
      value.invoiceNo ||
      `#${value.id ?? ""}`
    );
  }
  return value;
};

const getProductName = (row) =>
  label(row.product?.name || row.product?.productName || row.product);

const formatPurchaseType = (value) => {
  if (!value) return "-";
  return value
    .toString()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function StockTable({
  data,
  onEdit,
  onDelete,
  onStatusChange,
  onPrintLabel,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}) {
  const allSelected = data.length > 0 && data.every((row) => selectedIds.includes(row.id));

  return (
    <div className="overflow-hidden rounded border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleSelectAll?.(e.target.checked)}
              />
            </th>
            <th className="p-3 text-left">Inventory Code</th>
            {/* ...rest of headers unchanged... */}
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => onToggleSelect?.(row.id)}
                  />
                </td>
                <td className="p-3">{row.inventoryCode || "-"}</td>
                {/* ...rest of row unchanged... */}
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={10}>
                No inventory records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
