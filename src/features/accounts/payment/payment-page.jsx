import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Printer,
  Ban,
  ArrowUpRight,
  Calendar,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Building,
  User,
  Phone,
  FileText,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { notifySuccess, notifyError } from "@/utils/notify";
import { useAuthStore } from "@/store/authStore";
import {
  getPaymentVouchers,
  createPaymentVoucher,
  cancelVoucher,
  getNextVoucherNumber,
  getPendingPurchases,
  getAccountingSummary,
} from "@/api/accounting-api";
import { getParties } from "@/api/party-api";
import VoucherPrintModal from "../shared/voucher-print-modal";

const roundMoney = (v) => Math.round((Number(v || 0) + Number.EPSILON) * 100) / 100;
const money = (v) => roundMoney(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const EXPENSE_TYPES = [
  { id: "PURCHASE", label: "Supplier Purchase", desc: "Pay pending purchase invoice to bullion/jewellery supplier" },
  { id: "SALARY", label: "Salary Payment", desc: "Employee / staff wages & salary" },
  { id: "RENT", label: "Shop Rent", desc: "Showroom / office monthly rent" },
  { id: "ELECTRICITY", label: "Electricity Bill", desc: "Power & utility electricity expenses" },
  { id: "TRANSPORT", label: "Transport & Courier", desc: "Logistics, courier, and travel expenses" },
  { id: "EXPENSE", label: "Other Expenses", desc: "Tea, refreshments, maintenance, office stationery" },
];

export default function PaymentPage() {
  const selectedStore = useAuthStore((state) => state.selectedStore);

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [refFilter, setRefFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");

  // Print Modal
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [voucherToCancel, setVoucherToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // New Payment Form
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nextVoucherNo, setNextVoucherNo] = useState("");

  const [formData, setFormData] = useState({
    referenceType: "PURCHASE",
    date: new Date().toISOString().slice(0, 10),
    payTo: "",
    partyPhone: "",
    partyId: null,
    purchaseId: null,
    selectedPurchase: null,
    amount: "",
    paymentMode: "BANK_TRANSFER",
    bankName: "HDFC Bank",
    transactionRef: "",
    narration: "",
  });

  // Supplier pending purchases
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, sum, partiesRes] = await Promise.all([
        getPaymentVouchers({
          search: search || undefined,
          referenceType: refFilter !== "ALL" ? refFilter : undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          paymentMode: modeFilter !== "ALL" ? modeFilter : undefined,
        }),
        getAccountingSummary().catch(() => null),
        getParties().catch(() => []),
      ]);
      setVouchers(res?.vouchers || []);
      if (sum) setSummary(sum);
      setSuppliers(Array.isArray(partiesRes) ? partiesRes : partiesRes?.data || []);
    } catch (err) {
      console.error("Failed to load payment vouchers:", err);
      notifyError(err, "Could not load vouchers.");
    } finally {
      setLoading(false);
    }
  }, [search, refFilter, statusFilter, modeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Form
  const handleOpenCreate = async () => {
    try {
      const nextNo = await getNextVoucherNumber("PAYMENT");
      setNextVoucherNo(nextNo || "PV-000001");
    } catch (e) {
      setNextVoucherNo("PV-000001");
    }
    setFormData({
      referenceType: "PURCHASE",
      date: new Date().toISOString().slice(0, 10),
      payTo: "",
      partyPhone: "",
      partyId: null,
      purchaseId: null,
      selectedPurchase: null,
      amount: "",
      paymentMode: "BANK_TRANSFER",
      bankName: "HDFC Bank",
      transactionRef: "",
      narration: "",
    });
    setPendingPurchases([]);
    setFormOpen(true);
  };

  // Supplier selection -> fetch pending purchases
  const handleSupplierSelect = async (partyId) => {
    const pId = Number(partyId);
    const supplier = suppliers.find((s) => s.id === pId);
    setFormData((prev) => ({
      ...prev,
      partyId: pId || null,
      payTo: supplier?.name || "",
      partyPhone: supplier?.phone || "",
      purchaseId: null,
      selectedPurchase: null,
      amount: "",
    }));

    if (!pId) {
      setPendingPurchases([]);
      return;
    }

    setLoadingPurchases(true);
    try {
      const purchases = await getPendingPurchases({ partyId: pId });
      setPendingPurchases(purchases);
      if (purchases.length === 0) {
        notifyError(null, "No pending purchase invoices with due amount for this supplier.");
      }
    } catch (err) {
      notifyError(err, "Failed to fetch pending purchase invoices.");
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleSelectPurchase = (pur) => {
    setFormData((prev) => ({
      ...prev,
      purchaseId: pur.id,
      selectedPurchase: pur,
      amount: pur.dueAmount,
      narration: `Payment against Purchase Invoice ${pur.invoiceNo || `#${pur.id}`}`,
    }));
  };

  const handleSubmitVoucher = async () => {
    if (!formData.amount || Number(formData.amount) <= 0) {
      notifyError(null, "Please enter a valid payment amount greater than 0.");
      return;
    }

    if (formData.referenceType === "PURCHASE") {
      if (!formData.purchaseId || !formData.selectedPurchase) {
        notifyError(null, "Please select a pending purchase invoice.");
        return;
      }
      if (Number(formData.amount) > Number(formData.selectedPurchase.dueAmount) + 0.01) {
        notifyError(
          null,
          `Payment amount cannot exceed the pending due of ₹${money(formData.selectedPurchase.dueAmount)}.`
        );
        return;
      }
    } else {
      if (!formData.payTo?.trim()) {
        notifyError(null, "Pay To / Party Name is required.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await createPaymentVoucher(formData);
      notifySuccess(res.message || "Payment Voucher created successfully!");
      setFormOpen(false);
      loadData();
      if (res.data) {
        setSelectedVoucher(res.data);
        setPrintOpen(true);
      }
    } catch (err) {
      console.error("Create payment voucher failed:", err);
      notifyError(err, "Failed to create payment voucher.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!voucherToCancel) return;
    setCancelling(true);
    try {
      await cancelVoucher(voucherToCancel.id, cancelReason);
      notifySuccess(`Voucher ${voucherToCancel.voucherNo} cancelled and reversed successfully!`);
      setCancelModalOpen(false);
      setVoucherToCancel(null);
      setCancelReason("");
      loadData();
    } catch (err) {
      notifyError(err, "Failed to cancel voucher.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Voucher</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
              Money Paid
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Settle supplier purchase invoices, and record salary, rent, electricity, transport, and operational expenses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-slate-600"
          >
            <RotateCcw size={14} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-semibold"
          >
            <Plus size={16} />
            <span>New Payment Voucher</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowUpRight size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-slate-500">Today's Payments</div>
            <div className="text-xl font-bold text-slate-900 truncate">
              ₹{money(summary?.todayPayments || 0)}
            </div>
            <div className="text-[11px] text-rose-600 font-medium">Outflow recorded today</div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-slate-500">This Month's Payments</div>
            <div className="text-xl font-bold text-slate-900 truncate">
              ₹{money(summary?.monthPayments || 0)}
            </div>
            <div className="text-[11px] text-blue-600 font-medium">Cumulative month total</div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingDown size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-slate-500">Supplier Outstanding Dues</div>
            <div className="text-xl font-bold text-amber-700 truncate">
              ₹{money(summary?.totalSupplierDue || 0)}
            </div>
            <div className="text-[11px] text-slate-500">
              Across {summary?.pendingPurchasesCount || 0} purchase invoice(s)
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-slate-500">Total Vouchers</div>
            <div className="text-xl font-bold text-slate-900">{vouchers.length}</div>
            <div className="text-[11px] text-slate-500">In current view</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search voucher, payee, phone, ref doc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div>
            <select
              value={refFilter}
              onChange={(e) => setRefFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="ALL">All Payment Types</option>
              <option value="PURCHASE">Supplier Purchase</option>
              <option value="SALARY">Salary Payment</option>
              <option value="RENT">Shop Rent</option>
              <option value="ELECTRICITY">Electricity Bill</option>
              <option value="TRANSPORT">Transport</option>
              <option value="EXPENSE">Other Expenses</option>
            </select>
          </div>

          <div>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="ALL">All Payment Modes</option>
              <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI / Online</option>
              <option value="CASH">Cash Drawer</option>
              <option value="CARD">Card</option>
              <option value="CHEQUE">Cheque</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Voucher No</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Paid To / Payee</th>
                <th className="p-3.5">Reference Type</th>
                <th className="p-3.5">Payment Mode</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading payment vouchers...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No payment vouchers found. Click "+ New Payment Voucher" to make a payment.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const isCancelled = v.status === "CANCELLED";
                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isCancelled ? "bg-red-50/20 text-slate-400" : ""
                      }`}
                    >
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        <button
                          onClick={() => {
                            setSelectedVoucher(v);
                            setPrintOpen(true);
                          }}
                          className="hover:text-rose-600 underline cursor-pointer text-left"
                        >
                          {v.voucherNo}
                        </button>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {v.date ? new Date(v.date).toLocaleDateString("en-IN") : "-"}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{v.partyName || "Payee"}</div>
                        {v.partyPhone && (
                          <div className="text-[11px] text-slate-400">{v.partyPhone}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            v.referenceType === "PURCHASE"
                              ? "bg-amber-100 text-amber-800"
                              : v.referenceType === "SALARY"
                              ? "bg-blue-100 text-blue-800"
                              : v.referenceType === "RENT"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {v.referenceType === "PURCHASE"
                            ? `Pur: ${v.referenceDocNo || `#${v.referenceId}`}`
                            : v.referenceType}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          {v.paymentMode === "BANK_TRANSFER"
                            ? "Bank Transfer"
                            : v.paymentMode === "CASH"
                            ? "Cash"
                            : v.paymentMode}
                          {v.bankName ? ` (${v.bankName})` : ""}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹{money(v.amount)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCancelled
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedVoucher(v);
                              setPrintOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-rose-700"
                            title="Print / View Voucher Slip"
                          >
                            <Printer size={15} />
                          </Button>
                          {!isCancelled && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setVoucherToCancel(v);
                                setCancelReason("");
                                setCancelModalOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                              title="Cancel Voucher"
                            >
                              <Ban size={15} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          NEW PAYMENT VOUCHER DIALOG
      ========================================================= */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="!w-[95vw] !max-w-[850px] p-0 max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  New Payment Voucher
                </DialogTitle>
                <div className="text-xs text-slate-500 mt-0.5">
                  Record outgoing payments and reduce supplier outstanding invoices automatically.
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Voucher No</span>
                <span className="font-mono text-sm font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {nextVoucherNo}
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
            {/* 1. Expense Type Pills */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Payment Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EXPENSE_TYPES.map((type) => {
                  const active = formData.referenceType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          referenceType: type.id,
                          purchaseId: null,
                          selectedPurchase: null,
                          amount: "",
                        }))
                      }
                      className={`p-3 rounded-lg border text-left transition-all ${
                        active
                          ? "border-rose-600 bg-rose-50/70 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className={`font-bold ${active ? "text-rose-900" : "text-slate-800"}`}>
                        {type.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{type.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Supplier Purchase Flow */}
            {formData.referenceType === "PURCHASE" && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Select Supplier to Pay</span>
                  <span className="text-[11px] text-slate-500">Pick from registered party masters</span>
                </div>

                <div>
                  <select
                    value={formData.partyId || ""}
                    onChange={(e) => handleSupplierSelect(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-white px-3 text-xs font-medium"
                  >
                    <option value="">-- Choose Supplier / Party --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.phone ? `(${s.phone})` : ""} {s.partytype?.name ? `[${s.partytype.name}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {loadingPurchases && (
                  <div className="text-center p-3 text-slate-500">
                    Checking pending purchase invoices...
                  </div>
                )}

                {/* Pending Purchases Invoices List */}
                {pendingPurchases.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-[11px] font-medium text-slate-600">
                      Select a pending purchase invoice to pay:
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {pendingPurchases.map((pur) => {
                        const isSelected = formData.purchaseId === pur.id;
                        return (
                          <div
                            key={pur.id}
                            onClick={() => handleSelectPurchase(pur)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? "bg-rose-50 border-rose-500 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="font-mono text-rose-800">
                                  {pur.invoiceNo || pur.referenceNo || `PUR-#${pur.id}`}
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({new Date(pur.date).toLocaleDateString("en-IN")})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Type: {pur.purchaseType} | Net Total: ₹{money(pur.netPayable || pur.totalAmount)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[11px] text-slate-400">
                                Paid: ₹{money(pur.paidAmount)}
                              </div>
                              <div className="font-mono font-bold text-amber-700 text-sm">
                                Outstanding Due: ₹{money(pur.dueAmount)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.selectedPurchase && (
                  <div className="bg-rose-100/60 border border-rose-300 p-2.5 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-rose-900">Selected Purchase Invoice: </span>
                      <span className="font-mono font-bold text-rose-800">
                        {formData.selectedPurchase.invoiceNo || `#${formData.selectedPurchase.id}`}
                      </span>
                      <span className="text-rose-700 ml-2">
                        (Outstanding Due: ₹{money(formData.selectedPurchase.dueAmount)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          amount: formData.selectedPurchase.dueAmount,
                        }))
                      }
                      className="h-6 text-[11px] bg-white text-rose-800 border-rose-400"
                    >
                      Pay Full Due
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* General Payee Input for Non-Purchase Expenses */}
            {formData.referenceType !== "PURCHASE" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Pay To / Beneficiary Name *
                  </label>
                  <Input
                    placeholder={
                      formData.referenceType === "SALARY"
                        ? "Employee name..."
                        : formData.referenceType === "RENT"
                        ? "Landlord / Property name..."
                        : "Payee name..."
                    }
                    value={formData.payTo}
                    onChange={(e) => setFormData((p) => ({ ...p, payTo: e.target.value }))}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone / Reference</label>
                  <Input
                    placeholder="Contact or Reference ID..."
                    value={formData.partyPhone}
                    onChange={(e) => setFormData((p) => ({ ...p, partyPhone: e.target.value }))}
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* 3. Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Amount (₹) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                  className="text-xs font-mono font-bold text-rose-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Mode *</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData((p) => ({ ...p, paymentMode: e.target.value }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI / Net Banking</option>
                  <option value="CASH">Cash Drawer</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {formData.paymentMode !== "CASH" && (
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bank Name</label>
                  <Input
                    placeholder="e.g. HDFC Bank, SBI..."
                    value={formData.bankName}
                    onChange={(e) => setFormData((p) => ({ ...p, bankName: e.target.value }))}
                    className="text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">UTR / Cheque / Txn Ref</label>
                  <Input
                    placeholder="Transaction reference..."
                    value={formData.transactionRef}
                    onChange={(e) => setFormData((p) => ({ ...p, transactionRef: e.target.value }))}
                    className="text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* 4. Narration */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Narration / Remarks</label>
              <Textarea
                placeholder="Details of payment..."
                rows={2}
                value={formData.narration}
                onChange={(e) => setFormData((p) => ({ ...p, narration: e.target.value }))}
                className="text-xs"
              />
            </div>

            {/* 5. Live Double-Entry Preview */}
            <div className="bg-slate-900 text-white p-3 rounded-lg text-xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">
                Automatic Accounting Entry (Real-time preview)
              </div>
              <div className="font-mono flex justify-between">
                <span className="text-rose-400">
                  Dr. {formData.referenceType === "PURCHASE"
                    ? `Supplier A/C (${formData.payTo || "Supplier"})`
                    : formData.referenceType === "SALARY"
                    ? "Salary Expense A/C"
                    : formData.referenceType === "RENT"
                    ? "Rent Expense A/C"
                    : formData.referenceType === "ELECTRICITY"
                    ? "Electricity Expense A/C"
                    : formData.referenceType === "TRANSPORT"
                    ? "Transport Expense A/C"
                    : `Expense A/C (${formData.payTo || "General"})`}
                </span>
                <span className="font-bold">₹{money(formData.amount || 0)}</span>
              </div>
              <div className="font-mono flex justify-between pl-4">
                <span className="text-blue-300">
                  To {formData.paymentMode === "CASH" ? "Cash in Hand A/C" : "Bank / UPI A/C"}
                </span>
                <span className="font-bold">₹{money(formData.amount || 0)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitVoucher}
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {submitting ? "Processing Payment..." : "Save & Generate Voucher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          CANCEL VOUCHER DIALOG
      ========================================================= */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle size={18} />
              <span>Cancel Payment Voucher</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs text-slate-700 py-2">
            <p>
              Are you sure you want to cancel voucher{" "}
              <span className="font-mono font-bold text-slate-900">{voucherToCancel?.voucherNo}</span> (₹{money(voucherToCancel?.amount)})?
            </p>
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-amber-800">
              <span className="font-bold">Safety Reversal: </span>
              If this voucher was paid against a supplier purchase invoice, the purchase's due amount will be restored and the payment record removed.
            </div>
            <div>
              <label className="font-semibold block mb-1">Cancellation Reason</label>
              <Input
                placeholder="e.g. Cancelled payment, wrong supplier, duplicate..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Slip Modal */}
      <VoucherPrintModal
        open={printOpen}
        setOpen={setPrintOpen}
        voucher={selectedVoucher}
      />
    </div>
  );
}