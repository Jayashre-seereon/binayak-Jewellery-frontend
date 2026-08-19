import { PencilLine, Printer, Trash2 } from "lucide-react";

const STATUS_OPTIONS = [
  "AVAILABLE",
  "RESERVED",
  "SOLD",
  "TRANSFERRED",
  "RETURNED",
  "MELTED",
  "REFINED",
  "DAMAGED",
];

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
}) {
  return (
    <div className="overflow-hidden rounded border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Inventory Code</th>
            <th className="p-3 text-left">Invoice No</th>
            <th className="p-3 text-left">Purchase Type</th>
            <th className="p-3 text-left">Purchase Item</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Tag No</th>
            <th className="p-3 text-left">Barcode</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.length ? (
            data.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3">{row.inventoryCode || "-"}</td>
                <td className="p-3">{row.purchase?.invoiceNo || row.purchaseInvoiceNo || "-"}</td>
                <td className="p-3">{formatPurchaseType(row.purchaseType || row.purchase?.purchaseType)}</td>
                <td className="p-3">{row.purchaseItem?.purchaseItemCode || row.purchaseItemCode || "-"}</td>
                <td className="p-3">{getProductName(row)}</td>
                <td className="p-3">{row.tagNo || "-"}</td>
                <td className="p-3">{row.barcodeNo || "-"}</td>
                <td className="p-3">
                  <select
                    value={row.status || "AVAILABLE"}
                    onChange={(e) => onStatusChange?.(row.id, e.target.value)}
                    className="min-w-36 rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                  >
                    {!row.status ? <option value="AVAILABLE">AVAILABLE</option> : null}
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit?.(row)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                      aria-label="Edit inventory"
                      title="Edit"
                    >
                      <PencilLine size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(row.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete inventory"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrintLabel?.(row)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                      aria-label="Print inventory label"
                      title="Print Label"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={9}>
                No inventory records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
