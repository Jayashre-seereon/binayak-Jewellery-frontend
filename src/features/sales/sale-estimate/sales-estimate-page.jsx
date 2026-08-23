import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { notifyError, notifySuccess } from "@/utils/notify";
import { useAuthStore } from "@/store/authStore";
import { getParties } from "@/api/party-api";
import { getStock } from "@/api/stock-api";
import { getAdvancesByContact } from "@/api/advance-api";
import { getOldGoldPurchasesByPhone } from "@/api/purchase-api";
import { createSale, getSalePdf, getSales } from "./sale-estimate-api";
import { Download } from "lucide-react";

const PAYMENT_MODES = ["CASH", "ONLINE", "CARD", "UPI", "CHEQUE", "OTHER"];

const emptyLine = () => ({
  inventoryId: "",
  pieces: 1,
  grossWeight: 0,
  stoneWeight: 0,
  netWeight: 0,
  purity: "",
  rate: 0,
  metalAmount: 0,
  makingCharges: 0,
  stoneAmount: 0,
  discount: 0,
  totalAmount: 0,
});

const emptyPayment = () => ({
  paymentMode: "CASH",
  amount: 0,
  referenceNo: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  narration: "",
});

const emptyOldGold = () => ({
  purchaseId: "",
  description: "",
  value: 0,
});

const initialState = () => ({
  saleDate: new Date().toISOString().slice(0, 10),
  partyId: "",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  customerGst: "",
  narration: "",
  items: [emptyLine()],
  payments: [emptyPayment()],
  oldGold: [],
  advanceAdjustments: [],
});

const money = (value) => Number(value || 0).toFixed(2);
const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

export default function SalesPage() {
  const selectedStore = useAuthStore((state) => state.selectedStore);
  const storeId =
    selectedStore?.id ||
    selectedStore?.storeId ||
    localStorage.getItem("selectedStoreId");

  const [sales, setSales] = useState([]);
  const [parties, setParties] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(initialState());

  const loadData = async () => {
    try {
      setLoading(true);
      const [saleData, partyData, stockData, advanceData, purchaseData] = await Promise.all([
        getSales(),
        getParties(storeId),
        getStock(),
        Promise.resolve([]),
        Promise.resolve([]),
      ]);

      setSales(Array.isArray(saleData) ? saleData : []);
      setParties(
        Array.isArray(partyData?.data)
          ? partyData.data
          : Array.isArray(partyData?.parties)
            ? partyData.parties
            : Array.isArray(partyData)
              ? partyData
              : []
      );
      setInventories(Array.isArray(stockData) ? stockData : []);
      setAdvances(Array.isArray(advanceData) ? advanceData : []);
      setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
    } catch (error) {
      notifyError(error, "Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) loadData();
  }, [storeId]);

  const resetForm = () => setState(initialState());

  const selectedParty = parties.find((party) => String(party.id) === String(state.partyId));
  const activePhone = (selectedParty?.phone || state.customerPhone || "").trim();

  const availableInventories = useMemo(
    () => inventories.filter((inv) => inv.status === "AVAILABLE"),
    [inventories]
  );

  const purchaseOptions = useMemo(() => {
    if (!activePhone) return purchases;
    return purchases.filter((purchase) => {
      const partyPhone = (purchase.party?.phone || purchase.customerPhone || "").trim();
      return partyPhone === activePhone;
    });
  }, [purchases, activePhone]);

  const advanceOptions = useMemo(() => {
    if (!activePhone) return advances;
    return advances.filter((advance) => (advance.contactNumber || "").trim() === activePhone);
  }, [advances, activePhone]);

  const selectedOldGoldIds = state.oldGold
    .map((row) => String(row.purchaseId || ""))
    .filter(Boolean);

  const selectedAdvanceIds = state.advanceAdjustments
    .map((row) => String(row.advanceReceiveId || ""))
    .filter(Boolean);

  const updateField = (field, value) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setState((prev) => {
      const items = [...prev.items];
      const row = { ...items[index], [field]: value };

      if (field === "inventoryId") {
        const selected = inventories.find((inv) => String(inv.id) === String(value));
        if (selected) {
          row.grossWeight = selected.grossWeight || 0;
          row.stoneWeight = selected.stoneWeight || 0;
          row.netWeight = selected.netWeight || 0;
          row.purity = selected.purity ?? "";
        }
      }

      row.totalAmount =
        roundMoney(
          Number(row.metalAmount || 0) +
            Number(row.makingCharges || 0) +
            Number(row.stoneAmount || 0) -
            Number(row.discount || 0)
        );

      items[index] = row;
      return { ...prev, items };
    });
  };

  const totals = useMemo(() => {
    const subtotal = roundMoney(state.items.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0));
    const oldGoldAmount = roundMoney(state.oldGold.reduce((sum, row) => sum + Number(row.value || 0), 0));
    const advanceAmount = roundMoney(state.advanceAdjustments.reduce((sum, row) => sum + Number(row.amount || 0), 0));
    const payableAmount = roundMoney(Math.max(0, subtotal - oldGoldAmount - advanceAmount));
    const paidAmount = roundMoney(state.payments.reduce((sum, row) => sum + Number(row.amount || 0), 0));
    const dueAmount = roundMoney(Math.max(0, payableAmount - paidAmount));
    return { subtotal, oldGoldAmount, advanceAmount, payableAmount, paidAmount, dueAmount };
  }, [state]);

  useEffect(() => {
    const loadCustomerLookups = async () => {
      if (!activePhone) {
        setAdvances([]);
        setPurchases([]);
        return;
      }

      try {
        const [purchaseRows, advanceRows] = await Promise.all([
          getOldGoldPurchasesByPhone(activePhone),
          getAdvancesByContact(activePhone),
        ]);
        setPurchases(Array.isArray(purchaseRows) ? purchaseRows : []);
        setAdvances(Array.isArray(advanceRows) ? advanceRows : []);
      } catch (error) {
        notifyError(error, "Failed to load customer old gold and advance records.");
      }
    };

    loadCustomerLookups();
  }, [activePhone]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const payload = {
        saleDate: state.saleDate,
        partyId: state.partyId ? Number(state.partyId) : null,
        customerName: state.partyId ? selectedParty?.name || "" : state.customerName,
        customerPhone: state.partyId ? selectedParty?.phone || "" : state.customerPhone,
        customerAddress: state.partyId ? selectedParty?.address || "" : state.customerAddress,
        customerGst: state.partyId ? selectedParty?.gst || "" : state.customerGst,
        narration: state.narration || null,
        items: state.items
          .filter((row) => row.inventoryId)
          .map((row) => ({
            inventoryId: Number(row.inventoryId),
            pieces: Number(row.pieces || 1),
            grossWeight: Number(row.grossWeight || 0),
            stoneWeight: Number(row.stoneWeight || 0),
            netWeight: Number(row.netWeight || 0),
            purity: row.purity === "" ? null : Number(row.purity),
            rate: Number(row.rate || 0),
            metalAmount: Number(row.metalAmount || 0),
            makingCharges: Number(row.makingCharges || 0),
            stoneAmount: Number(row.stoneAmount || 0),
            discount: Number(row.discount || 0),
            taxableAmount: Number(row.totalAmount || 0),
            totalAmount: Number(row.totalAmount || 0),
          })),
        oldGold: state.oldGold
          .filter((row) => row.purchaseId)
          .map((row) => ({
            purchaseId: Number(row.purchaseId),
            description: row.description || null,
            value: Number(row.value || 0),
          })),
        advanceAdjustments: state.advanceAdjustments
          .filter((row) => row.advanceReceiveId)
          .map((row) => ({
            advanceReceiveId: Number(row.advanceReceiveId),
            amount: Number(row.amount || 0),
          })),
        payments: state.payments
          .filter((row) => Number(row.amount || 0) > 0)
          .map((row) => ({
            paymentMode: row.paymentMode,
            amount: Number(row.amount || 0),
            referenceNo: row.referenceNo || null,
            paymentDate: row.paymentDate,
            narration: row.narration || null,
          })),
      };

      await createSale(payload);
      notifySuccess("Sale completed successfully.");
      await loadData();
      setOpen(false);
      resetForm();
    } catch (error) {
      notifyError(error, "Unable to create sale. Please check the entered values and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadInvoice = async (sale) => {
    try {
      const pdf = await getSalePdf(sale.id);
      const pdfUrl = window.URL.createObjectURL(pdf);
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 10000);
    } catch (error) {
      notifyError(error, "Failed to open sale invoice.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sales Invoice</h1>
          <p className="text-sm text-gray-500">
            Inventory values auto-fill. Old gold uses purchase invoice. Advance uses phone number.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Add Sale
        </Button>
      </div>

      <div className="rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Invoice No</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Gross Total</th>
              <th className="p-3 text-left">Due</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={8}>
                  Loading sales...
                </td>
              </tr>
            ) : sales.length ? (
              sales.map((sale) => (
                <tr key={sale.id} className="border-t">
                  <td className="p-3">{sale.invoiceNo}</td>
                  <td className="p-3">{sale.party?.name || sale.customerName || "-"}</td>
                  <td className="p-3">{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : "-"}</td>
                  <td className="p-3">{sale.items?.length || 0}</td>
                  <td className="p-3">{money(sale.grossTotal)}</td>
                  <td className="p-3">{money(sale.dueAmount)}</td>
                  <td className="p-3">{sale.status || "-"}</td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadInvoice(sale)}
                      title="Download invoice"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={8}>
                  No sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!w-[95vw] !max-w-[1300px] h-[90vh] p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Create Sale</DialogTitle>
          </DialogHeader>

          <div className="h-[calc(90vh-130px)] overflow-y-auto space-y-6 p-6">
            <div className="rounded border bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <select className="h-10 rounded border px-3" value={state.partyId} onChange={(e) => updateField("partyId", e.target.value)}>
                  <option value="">New Customer</option>
                  {parties.map((party) => (
                    <option key={party.id} value={party.id}>{party.name}</option>
                  ))}
                </select>
                <Input type="date" value={state.saleDate} onChange={(e) => updateField("saleDate", e.target.value)} />
                <Input placeholder="Customer name" value={state.partyId ? selectedParty?.name || "" : state.customerName} onChange={(e) => updateField("customerName", e.target.value)} />
                <Input placeholder="Phone" value={state.partyId ? selectedParty?.phone || "" : state.customerPhone} onChange={(e) => updateField("customerPhone", e.target.value)} />
                <Input placeholder="Address" value={state.partyId ? selectedParty?.address || "" : state.customerAddress} onChange={(e) => updateField("customerAddress", e.target.value)} />
                <Input placeholder="GST" value={state.partyId ? selectedParty?.gst || "" : state.customerGst} onChange={(e) => updateField("customerGst", e.target.value)} />
              </div>
            </div>

            <div className="rounded border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Inventory Items</h2>
                <Button variant="outline" onClick={() => setState((prev) => ({ ...prev, items: [...prev.items, emptyLine()] }))}>Add Item</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[1250px] w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Inventory</th>
                      <th className="p-2 text-left">Pieces</th>
                      <th className="p-2 text-left">Gross</th>
                      <th className="p-2 text-left">Stone</th>
                      <th className="p-2 text-left">Net</th>
                      <th className="p-2 text-left">Rate</th>
                      <th className="p-2 text-left">Making</th>
                      <th className="p-2 text-left">Stone Amt</th>
                      <th className="p-2 text-left">Discount</th>
                      <th className="p-2 text-left">Total</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.items.map((row, index) => (
                      <tr key={index} className="border-t align-top">
                        <td className="p-2">
                          <select className="h-10 w-56 rounded border px-2" value={row.inventoryId} onChange={(e) => updateItem(index, "inventoryId", e.target.value)}>
                            <option value="">Select inventory</option>
                            {availableInventories.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.inventoryCode} - {inv.item?.name || inv.product?.name || "Item"}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2"><Input type="number" value={row.pieces} onChange={(e) => updateItem(index, "pieces", e.target.value)} className="w-20" /></td>
                        <td className="p-2"><Input type="number" value={row.grossWeight} readOnly className="w-24 bg-gray-50" /></td>
                        <td className="p-2"><Input type="number" value={row.stoneWeight} readOnly className="w-24 bg-gray-50" /></td>
                        <td className="p-2"><Input type="number" value={row.netWeight} readOnly className="w-24 bg-gray-50" /></td>
                        <td className="p-2"><Input type="number" value={row.rate} onChange={(e) => updateItem(index, "rate", e.target.value)} className="w-24" /></td>
                        <td className="p-2"><Input type="number" value={row.makingCharges} onChange={(e) => updateItem(index, "makingCharges", e.target.value)} className="w-24" /></td>
                        <td className="p-2"><Input type="number" value={row.stoneAmount} onChange={(e) => updateItem(index, "stoneAmount", e.target.value)} className="w-24" /></td>
                        <td className="p-2"><Input type="number" value={row.discount} onChange={(e) => updateItem(index, "discount", e.target.value)} className="w-24" /></td>
                        <td className="p-2 font-semibold">{money(row.totalAmount)}</td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm" onClick={() => setState((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))}>
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">Old Gold Adjustment</h2>
                  <Button variant="outline" onClick={() => setState((prev) => ({ ...prev, oldGold: [...prev.oldGold, emptyOldGold()] }))}>Add Old Gold</Button>
                </div>
                <div className="space-y-3">
                  {state.oldGold.map((row, index) => (
                    <div key={index} className="grid gap-2 rounded border p-3">
                      <select
                        className="h-10 rounded border px-3"
                        value={row.purchaseId}
                        onChange={(e) => {
                          const selected = purchaseOptions.find((p) => String(p.id) === String(e.target.value));
                          setState((prev) => ({
                            ...prev,
                            oldGold: prev.oldGold.map((r, i) =>
                              i === index
                                ? {
                                    ...r,
                                    purchaseId: e.target.value,
                                    value: selected?.totalAmount || 0,
                                    description: selected?.invoiceNo || "",
                                  }
                                : r
                            ),
                          }));
                        }}
                      >
                        <option value="">Select purchase invoice</option>
                        {purchaseOptions.map((purchase) => (
                          <option
                            key={purchase.id}
                            value={purchase.id}
                            disabled={selectedOldGoldIds.includes(String(purchase.id)) && String(row.purchaseId) !== String(purchase.id)}
                          >
                            {purchase.invoiceNo} - {purchase.party?.name || purchase.customerName || "-"} - {money(purchase.totalAmount)}
                          </option>
                        ))}
                      </select>
                      <Input placeholder="Description" value={row.description} onChange={(e) => setState((prev) => ({ ...prev, oldGold: prev.oldGold.map((r, i) => (i === index ? { ...r, description: e.target.value } : r)) }))} />
                      <Input type="number" placeholder="Amount" value={row.value} readOnly className="bg-gray-50" />
                      <Button variant="ghost" size="sm" onClick={() => setState((prev) => ({ ...prev, oldGold: prev.oldGold.filter((_, i) => i !== index) }))}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">Advance Adjustment</h2>
                  <Button variant="outline" onClick={() => setState((prev) => ({ ...prev, advanceAdjustments: [...prev.advanceAdjustments, { advanceReceiveId: "", amount: 0 }] }))}>Add Advance</Button>
                </div>
                <div className="space-y-3">
                  {state.advanceAdjustments.map((row, index) => (
                    <div key={index} className="grid gap-2 rounded border p-3">
                      <select
                        className="h-10 rounded border px-3"
                        value={row.advanceReceiveId}
                        onChange={(e) => {
                          const selected = advanceOptions.find((a) => String(a.id) === String(e.target.value));
                          setState((prev) => ({
                            ...prev,
                            advanceAdjustments: prev.advanceAdjustments.map((r, i) =>
                              i === index ? { ...r, advanceReceiveId: e.target.value, amount: selected?.amount || 0 } : r
                            ),
                          }));
                        }}
                      >
                        <option value="">Select advance by phone</option>
                        {advanceOptions.map((advance) => (
                          <option
                            key={advance.id}
                            value={advance.id}
                            disabled={selectedAdvanceIds.includes(String(advance.id)) && String(row.advanceReceiveId) !== String(advance.id)}
                          >
                            {advance.customerName} {advance.contactNumber ? `(${advance.contactNumber})` : ""} - {money(advance.amount)}
                          </option>
                        ))}
                      </select>
                      <Input type="number" placeholder="Amount" value={row.amount} readOnly className="bg-gray-50" />
                      <Button variant="ghost" size="sm" onClick={() => setState((prev) => ({ ...prev, advanceAdjustments: prev.advanceAdjustments.filter((_, i) => i !== index) }))}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Payments</h2>
                <Button variant="outline" onClick={() => setState((prev) => ({ ...prev, payments: [...prev.payments, emptyPayment()] }))}>Add Payment</Button>
              </div>
              <div className="space-y-3">
                {state.payments.map((row, index) => (
                  <div key={index} className="grid gap-3 rounded border p-3 md:grid-cols-5">
                    <select className="h-10 rounded border px-3" value={row.paymentMode} onChange={(e) => setState((prev) => ({ ...prev, payments: prev.payments.map((r, i) => (i === index ? { ...r, paymentMode: e.target.value } : r)) }))}>
                      {PAYMENT_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                    </select>
                    <Input type="number" placeholder="Amount" value={row.amount} onChange={(e) => setState((prev) => ({ ...prev, payments: prev.payments.map((r, i) => (i === index ? { ...r, amount: e.target.value } : r)) }))} />
                    <Input placeholder="Reference No" value={row.referenceNo} onChange={(e) => setState((prev) => ({ ...prev, payments: prev.payments.map((r, i) => (i === index ? { ...r, referenceNo: e.target.value } : r)) }))} />
                    <Input type="date" value={row.paymentDate} onChange={(e) => setState((prev) => ({ ...prev, payments: prev.payments.map((r, i) => (i === index ? { ...r, paymentDate: e.target.value } : r)) }))} />
                    <Input placeholder="Narration" value={row.narration} onChange={(e) => setState((prev) => ({ ...prev, payments: prev.payments.map((r, i) => (i === index ? { ...r, narration: e.target.value } : r)) }))} />
                    <div className="md:col-span-5">
                      <Button variant="ghost" size="sm" onClick={() => setState((prev) => ({ ...prev, payments: prev.payments.filter((_, i) => i !== index) }))}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Summary</h2>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving..." : "Complete Sale"}
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
                <div className="flex justify-between"><span>Old Gold</span><span>{money(totals.oldGoldAmount)}</span></div>
                <div className="flex justify-between"><span>Advance</span><span>{money(totals.advanceAmount)}</span></div>
                <div className="flex justify-between font-semibold"><span>Payable</span><span>{money(totals.payableAmount)}</span></div>
                <div className="flex justify-between"><span>Paid</span><span>{money(totals.paidAmount)}</span></div>
                <div className="flex justify-between font-semibold text-red-600"><span>Due</span><span>{money(totals.dueAmount)}</span></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
