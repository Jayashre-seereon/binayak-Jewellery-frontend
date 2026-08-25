import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { notifyError, notifySuccess } from "@/utils/notify";
import { useAuthStore } from "@/store/authStore";
import { getParties } from "@/api/party-api";
import { getStock } from "@/api/stock-api";
import { getRates } from "@/api/rate-api";
import { createSale, getSalePdf, getSales } from "./sale-estimate-api";
import { Download, Eye, Plus, Trash2, ScanBarcode, Printer, Search, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react";
import SalesInvoicePreviewModal from "./sales-invoice-preview-modal";

const PAYMENT_MODES = ["CASH", "ONLINE", "CARD", "UPI", "CHEQUE", "OTHER"];
const PAYMENT_CHANNELS = ["PhonePe", "GooglePay", "PayTM", "UPI", "Debit Card", "Credit Card", "Cash", "Net Banking", "Cheque", "Other"];

// Validation Patterns
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const roundMoney = (val) => Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100;
const money = (val) => Number(val || 0).toFixed(2);
const weightStr = (val) => Number(val || 0).toFixed(3);

const numberToWordsClient = (amount) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const num = Math.round(Number(amount || 0) * 100) / 100;
  if (isNaN(num) || num <= 0) return "Zero Rupees Only.";

  const integerPart = Math.floor(num);
  const paisePart = Math.round((num - integerPart) * 100);

  const convertTwoDigits = (n) => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]}${n % 10 > 0 ? " " + ones[n % 10] : ""}`.trim();
  };

  const convertThreeDigits = (n) => {
    const hundred = Math.floor(n / 100);
    const rem = n % 100;
    let s = hundred > 0 ? `${ones[hundred]} Hundred` : "";
    if (rem > 0) s += (s ? " and " : "") + convertTwoDigits(rem);
    return s.trim();
  };

  let remaining = integerPart;
  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  const hundred = remaining;

  const parts = [];
  if (crore > 0) parts.push(`${convertTwoDigits(crore)} Crore`);
  if (lakh > 0) parts.push(`${convertTwoDigits(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertTwoDigits(thousand)} Thousand`);
  if (hundred > 0) parts.push(convertThreeDigits(hundred));

  let words = parts.join(" ").trim() || "Zero";
  words += " Rupees";
  if (paisePart > 0) words += ` and ${convertTwoDigits(paisePart)} Paise`;
  return words + " Only.";
};

const emptyPayment = (defaultAmount = 0) => ({
  paymentMode: "ONLINE",
  paymentChannel: "PhonePe",
  amount: defaultAmount,
  transactionId: "",
  referenceNo: "",
  description: "UPI/QR CODE RECEIPT",
  paymentDate: new Date().toISOString().slice(0, 10),
  narration: "",
});

const initialState = () => ({
  saleDate: new Date().toISOString().slice(0, 10),
  partyId: "",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  customerCity: "Bhubaneswar - 766001",
  customerPan: "",
  customerGst: "",
  customerState: "ODISHA",
  placeOfSupply: "ODISHA",
  cinNo: "U36911OR2005PTCC008217",
  storeGst: "21AAFCA3795A1Z5",
  irnNo: "",
  narration: "",
  offerDiscount: 0,
  discount: 0,
  lessUrd: 0,
  roundOff: 0,
  isManualRoundOff: false,
  items: [],
  payments: [emptyPayment(0)],
});

export default function SalesPage() {
  const selectedStore = useAuthStore((state) => state.selectedStore);
  const storeId =
    selectedStore?.id ||
    selectedStore?.storeId ||
    localStorage.getItem("selectedStoreId");

  const [sales, setSales] = useState([]);
  const [parties, setParties] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [rateMasters, setRateMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [state, setState] = useState(initialState());
  const [previewSale, setPreviewSale] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const barcodeInputRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [saleData, partyData, stockData, rateData] = await Promise.all([
        getSales().catch(() => []),
        getParties(storeId).catch(() => []),
        getStock().catch(() => []),
        getRates ? getRates().catch(() => []) : Promise.resolve([]),
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
      setRateMasters(
        Array.isArray(rateData?.rates)
          ? rateData.rates
          : Array.isArray(rateData)
            ? rateData
            : []
      );
    } catch (error) {
      notifyError(error, "Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) loadData();
  }, [storeId]);

  const availableInventories = useMemo(
    () => inventories.filter((inv) => inv.status === "AVAILABLE"),
    [inventories]
  );

  const handlePartyChange = (pId) => {
    setValidationErrors((prev) => ({ ...prev, customerName: null, customerPhone: null }));
    if (!pId) {
      setState((prev) => ({
        ...prev,
        partyId: "",
      }));
      return;
    }
    const party = parties.find((p) => String(p.id) === String(pId));
    if (party) {
      setState((prev) => ({
        ...prev,
        partyId: pId,
        customerName: party.name || "",
        customerPhone: party.phone || "",
        customerAddress: party.address || "",
        customerGst: party.gst || "",
        customerState: party.state || prev.customerState,
        placeOfSupply: party.state || prev.placeOfSupply,
      }));
    }
  };

  const updateField = (field, value) => {
    setState((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // ADD ITEM FROM INVENTORY OBJECT
  const addInventoryItem = (inv) => {
    if (!inv) return;
    const isAlreadyAdded = state.items.some((it) => String(it.inventoryId) === String(inv.id));
    if (isAlreadyAdded) {
      notifyError(null, `Item ${inv.barcodeNo || inv.inventoryCode} is already added in the table.`);
      return;
    }

    let defaultRate = 0;
    if (rateMasters.length && inv.purityId) {
      const matchRate = rateMasters.find((rm) => String(rm.purityId) === String(inv.purityId));
      if (matchRate) defaultRate = matchRate.saleRate || 0;
    }

    const grossWt = Number(inv.grossWeight || 0);
    const stoneWt = Number(inv.stoneWeight || 0);
    const netWt = Number(inv.netWeight || Math.max(0, grossWt - stoneWt));
    const metalAmt = roundMoney(netWt * defaultRate);

    const newLine = {
      inventoryId: inv.id,
      particulars: (inv.item?.name || inv.product?.name || "Jewellery Item").toUpperCase(),
      itemCode: inv.barcodeNo || inv.tagNo || inv.inventoryCode || "",
      huidNo: inv.huidNo || inv.purchaseItem?.huidNo || "",
      hsnCode: inv.hsnCode || inv.purchaseItem?.hsnCode || "711319",
      purityName: inv.purityMaster?.name || (inv.purity ? `${inv.purity}K` : "22K"),
      pieces: Math.max(1, Number(inv.pieces || inv.purchaseItem?.pieces || 1)),
      grossWeight: grossWt,
      stoneWeight: stoneWt,
      netWeight: netWt,
      purity: inv.purity ?? "",
      rate: defaultRate,
      metalAmount: metalAmt,
      makingChargeType: "PERCENT",
      makingChargeRate: 0,
      makingCharges: 0,
      stoneAmount: Number(inv.purchaseItem?.stoneAmount || 0),
      otherCharges: Number(inv.purchaseItem?.otherAmount || 0),
      discount: 0,
      totalAmount: roundMoney(metalAmt + Number(inv.purchaseItem?.stoneAmount || 0) + Number(inv.purchaseItem?.otherAmount || 0)),
    };

    setState((prev) => ({
      ...prev,
      items: [...prev.items, newLine],
    }));
    notifySuccess(`Added: ${newLine.particulars} (${newLine.itemCode})`);
  };

  // BARCODE SCAN HANDLER
  const handleBarcodeScan = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const code = barcodeInput.trim();
      if (!code) return;

      const found = availableInventories.find(
        (inv) =>
          String(inv.barcodeNo || "").toLowerCase() === code.toLowerCase() ||
          String(inv.tagNo || "").toLowerCase() === code.toLowerCase() ||
          String(inv.inventoryCode || "").toLowerCase() === code.toLowerCase()
      );

      if (found) {
        addInventoryItem(found);
        setBarcodeInput("");
      } else {
        notifyError(null, `No available stock item found matching barcode "${code}".`);
      }
    }
  };

  // UPDATE LINE ITEM & LIVE ROW RECALCULATION
  const updateItem = (index, field, value) => {
    setState((prev) => {
      const items = [...prev.items];
      const row = { ...items[index], [field]: value };

      const grossWt = Math.max(0, Number(row.grossWeight || 0));
      const stoneWt = Math.max(0, Number(row.stoneWeight || 0));
      let netWt = Number(row.netWeight || 0);

      if (field === "grossWeight" || field === "stoneWeight") {
        netWt = Math.max(0, roundMoney(grossWt - stoneWt));
        row.netWeight = netWt;
      }

      const rate = Math.max(0, Number(row.rate || 0));
      const metalAmt = roundMoney(netWt * rate);
      row.metalAmount = metalAmt;

      const mType = row.makingChargeType || "PERCENT";
      const mRate = Math.max(0, Number(row.makingChargeRate || 0));
      let makingAmt = 0;

      if (field === "makingCharges" && mType === "FLAT") {
        makingAmt = roundMoney(Math.max(0, Number(value || 0)));
        row.makingCharges = makingAmt;
      } else if (mType === "PERCENT") {
        makingAmt = roundMoney((metalAmt * mRate) / 100);
        row.makingCharges = makingAmt;
      } else if (mType === "PER_GRAM") {
        makingAmt = roundMoney(netWt * mRate);
        row.makingCharges = makingAmt;
      } else {
        makingAmt = roundMoney(Math.max(0, Number(row.makingCharges || 0)));
      }

      const stoneAmt = Math.max(0, roundMoney(Number(row.stoneAmount || 0)));
      const otherCharges = Math.max(0, roundMoney(Number(row.otherCharges || 0)));
      const itemDisc = Math.max(0, roundMoney(Number(row.discount || 0)));

      row.totalAmount = roundMoney(Math.max(0, metalAmt + makingAmt + stoneAmt + otherCharges - itemDisc));
      items[index] = row;
      return { ...prev, items };
    });
  };

  const removeItem = (index) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // TOTALS & LIVE ACCURATE GST CALCULATIONS
  const calculations = useMemo(() => {
    const grossAmount = roundMoney(
      state.items.reduce((sum, it) => sum + Number(it.totalAmount || 0), 0)
    );
    const offerDiscount = Math.max(0, roundMoney(Number(state.offerDiscount || 0)));
    const discount = Math.max(0, roundMoney(Number(state.discount || 0)));
    const taxableAmount = roundMoney(Math.max(0, grossAmount - offerDiscount - discount));

    const storeState = (selectedStore?.state || "ODISHA").trim().toUpperCase();
    const placeOfSupply = (state.placeOfSupply || state.customerState || storeState).trim().toUpperCase();
    const isInterState = placeOfSupply !== "" && placeOfSupply !== storeState;

    let cgstPercent = 0;
    let cgstAmount = 0;
    let sgstPercent = 0;
    let sgstAmount = 0;
    let igstPercent = 0;
    let igstAmount = 0;

    if (isInterState) {
      igstPercent = 3.0;
      igstAmount = roundMoney((taxableAmount * 3.0) / 100);
    } else {
      cgstPercent = 1.5;
      cgstAmount = roundMoney((taxableAmount * 1.5) / 100);
      sgstPercent = 1.5;
      sgstAmount = roundMoney((taxableAmount * 1.5) / 100);
    }

    const totalTax = roundMoney(cgstAmount + sgstAmount + igstAmount);
    const subTotal = roundMoney(taxableAmount + totalTax);
    const lessUrd = Math.max(0, roundMoney(Number(state.lessUrd || 0)));
    const unroundedNet = roundMoney(subTotal - lessUrd);

    let roundOff = roundMoney(Number(state.roundOff || 0));
    if (!state.isManualRoundOff) {
      const roundedInt = Math.round(unroundedNet);
      roundOff = roundMoney(roundedInt - unroundedNet);
    }

    const netPayable = roundMoney(Math.max(0, unroundedNet + roundOff));
    const inWords = numberToWordsClient(netPayable);

    const paidAmount = roundMoney(
      state.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    );
    const dueAmount = roundMoney(Math.max(0, netPayable - paidAmount));

    return {
      grossAmount,
      offerDiscount,
      discount,
      taxableAmount,
      cgstPercent,
      cgstAmount,
      sgstPercent,
      sgstAmount,
      igstPercent,
      igstAmount,
      totalTax,
      subTotal,
      lessUrd,
      roundOff,
      netPayable,
      paidAmount,
      dueAmount,
      inWords,
    };
  }, [state, selectedStore]);

  // SYNC PAYMENT TO NET PAYABLE
  const syncPaymentAmount = () => {
    setState((prev) => {
      if (prev.payments.length === 1) {
        return {
          ...prev,
          payments: [{ ...prev.payments[0], amount: calculations.netPayable }],
        };
      }
      return prev;
    });
  };

  const openCreateModal = () => {
    setState(initialState());
    setValidationErrors({});
    setOpen(true);
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 250);
  };

  // STRICT VALIDATION
  const validateForm = () => {
    const errors = {};

    if (!state.customerName?.trim() && !state.partyId) {
      errors.customerName = "Customer name is required.";
    }

    if (state.customerPhone?.trim()) {
      const cleanedPhone = state.customerPhone.trim().replace(/\D/g, "");
      if (cleanedPhone.length !== 10) {
        errors.customerPhone = "Contact number must be exactly 10 digits.";
      }
    }

    if (state.customerPan?.trim()) {
      const cleanedPan = state.customerPan.trim().toUpperCase();
      if (!PAN_REGEX.test(cleanedPan)) {
        errors.customerPan = "Invalid PAN format (e.g. ABCDE1234F).";
      }
    }

    if (state.customerGst?.trim()) {
      const cleanedGst = state.customerGst.trim().toUpperCase();
      if (!GSTIN_REGEX.test(cleanedGst)) {
        errors.customerGst = "Invalid GSTIN format (e.g. 21AAFCA3795A1Z5).";
      }
    }

    if (!state.placeOfSupply?.trim()) {
      errors.placeOfSupply = "Place of Supply is required for tax calculation.";
    }

    if (state.items.length === 0) {
      errors.items = "Please add at least one jewellery item.";
    } else {
      state.items.forEach((it, idx) => {
        if (!it.inventoryId) {
          errors[`item_${idx}`] = `Item #${idx + 1} has no inventory ID selected.`;
        }
        if (Number(it.netWeight || 0) <= 0) {
          errors[`item_weight_${idx}`] = `Item #${idx + 1} net weight must be greater than 0.`;
        }
        if (Number(it.rate || 0) <= 0) {
          errors[`item_rate_${idx}`] = `Item #${idx + 1} rate must be greater than 0.`;
        }
      });
    }

    if (calculations.offerDiscount + calculations.discount > calculations.grossAmount) {
      errors.discount = "Total discount cannot exceed gross amount.";
    }

    if (calculations.lessUrd > calculations.subTotal) {
      errors.lessUrd = "Less URD cannot exceed subtotal amount.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitSale = async () => {
    if (!validateForm()) {
      notifyError(null, "Please fix the highlighted validation errors before proceeding.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        saleDate: state.saleDate,
        partyId: state.partyId ? Number(state.partyId) : null,
        customerName: state.customerName.trim(),
        customerPhone: state.customerPhone?.trim() || null,
        customerAddress: state.customerAddress?.trim() || null,
        customerCity: state.customerCity?.trim() || null,
        customerPan: state.customerPan?.trim().toUpperCase() || null,
        customerGst: state.customerGst?.trim().toUpperCase() || null,
        customerState: state.customerState?.trim().toUpperCase() || "ODISHA",
        placeOfSupply: state.placeOfSupply?.trim().toUpperCase() || "ODISHA",
        cinNo: state.cinNo?.trim() || null,
        storeGst: state.storeGst?.trim() || null,
        irnNo: state.irnNo?.trim() || null,
        narration: state.narration?.trim() || null,

        offerDiscount: calculations.offerDiscount,
        discount: calculations.discount,
        lessUrd: calculations.lessUrd,
        roundOff: calculations.roundOff,

        items: state.items.map((it) => ({
          inventoryId: Number(it.inventoryId),
          particulars: it.particulars,
          itemCode: it.itemCode,
          huidNo: it.huidNo || null,
          hsnCode: it.hsnCode,
          purityName: it.purityName,
          pieces: Math.max(1, Number(it.pieces || 1)),
          grossWeight: Number(it.grossWeight || 0),
          stoneWeight: Number(it.stoneWeight || 0),
          netWeight: Number(it.netWeight || 0),
          purity: it.purity ? Number(it.purity) : null,
          rate: Number(it.rate || 0),
          metalAmount: Number(it.metalAmount || 0),
          makingCharges: Number(it.makingCharges || 0),
          makingChargeType: it.makingChargeType,
          makingChargeRate: Number(it.makingChargeRate || 0),
          stoneAmount: Number(it.stoneAmount || 0),
          otherCharges: Number(it.otherCharges || 0),
          discount: Number(it.discount || 0),
          totalAmount: Number(it.totalAmount || 0),
        })),

        payments: state.payments
          .filter((p) => Number(p.amount || 0) > 0)
          .map((p) => ({
            paymentMode: p.paymentMode,
            paymentChannel: p.paymentChannel,
            amount: Number(p.amount || 0),
            transactionId: p.transactionId || p.referenceNo,
            referenceNo: p.referenceNo || p.transactionId,
            description: p.description,
            paymentDate: p.paymentDate,
            narration: p.narration,
          })),
      };

      const result = await createSale(payload);
      notifySuccess(`Sale invoice created successfully: ${result?.invoiceNo || result?.sale?.invoiceNo}`);
      await loadData();
      setOpen(false);

      if (result?.sale) {
        setPreviewSale(result.sale);
        setPreviewOpen(true);
      }
    } catch (error) {
      notifyError(error, "Unable to create sale. Please check values and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleViewInvoice = (sale) => {
    setPreviewSale(sale);
    setPreviewOpen(true);
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

  const filteredSales = useMemo(() => {
    if (!searchFilter) return sales;
    const q = searchFilter.toLowerCase();
    return sales.filter(
      (s) =>
        (s.invoiceNo && s.invoiceNo.toLowerCase().includes(q)) ||
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.party?.name && s.party.name.toLowerCase().includes(q)) ||
        (s.customerPhone && s.customerPhone.includes(q))
    );
  }, [sales, searchFilter]);

  return (
    <div className="space-y-4 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales Invoice Management</h1>
            <p className="text-xs text-slate-500">
              Tax invoice creation with barcode scanner, live GST breakdown, and real jewellery format.
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm font-semibold">
          <Plus className="h-4 w-4" /> Create Sale
        </Button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by Invoice No, Customer Name, Phone..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-9 text-xs focus-visible:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-600 font-medium">
          Total Invoices: <span className="font-bold text-blue-600">{filteredSales.length}</span>
        </div>
      </div>

      {/* SALES LIST TABLE */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th className="p-3 text-left">Invoice No</th>
              <th className="p-3 text-left">Customer Name</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-center">Items</th>
              <th className="p-3 text-right">Taxable (₹)</th>
              <th className="p-3 text-right">Tax (₹)</th>
              <th className="p-3 text-right">Net Payable (₹)</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td className="p-8 text-center text-slate-400" colSpan={9}>
                  Loading sales invoices...
                </td>
              </tr>
            ) : filteredSales.length ? (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-blue-50/40 transition">
                  <td className="p-3 font-semibold text-blue-700">{sale.invoiceNo}</td>
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{sale.party?.name || sale.customerName || "-"}</div>
                    {sale.customerPhone && <div className="text-xs text-slate-400">{sale.customerPhone}</div>}
                  </td>
                  <td className="p-3 text-xs text-slate-600">{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString("en-IN") : "-"}</td>
                  <td className="p-3 text-center font-medium text-slate-800">{sale.items?.length || 0}</td>
                  <td className="p-3 text-right">{money(sale.taxableAmount || sale.grossTotal)}</td>
                  <td className="p-3 text-right">{money(sale.totalTax || sale.taxAmount)}</td>
                  <td className="p-3 text-right font-bold text-slate-900">₹{money(sale.netPayable || sale.grossTotal)}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> {sale.status || "COMPLETED"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewInvoice(sale)}
                        title="View / Print Tax Invoice"
                        className="hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadInvoice(sale)}
                        title="Download PDF"
                        className="hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-8 text-center text-slate-400" colSpan={9}>
                  No sales invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE SALE MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!w-[96vw] !max-w-[1400px] h-[92vh] p-0 flex flex-col bg-slate-50 border border-slate-300">
          {/* MODAL HEADER */}
          <DialogHeader className="border-b border-slate-200 px-6 py-3.5 bg-white flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">Create Jewellery Tax Invoice</DialogTitle>
                <p className="text-xs text-slate-500">Scan barcode or pick inventory, fill customer details and review live calculation.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSale}
                disabled={saving || state.items.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
              >
                {saving ? "Generating Invoice..." : "Complete & Generate Tax Invoice"}
              </Button>
            </div>
          </DialogHeader>

          {/* MODAL SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* 1. TOP BAR: BARCODE SCANNER & STOCK PICKER */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* BARCODE SCANNER */}
                <div className="flex-1 w-full flex items-center gap-2">
                  <div className="relative flex-1">
                    <ScanBarcode className="absolute left-3 top-2.5 h-5 w-5 text-blue-600" />
                    <Input
                      ref={barcodeInputRef}
                      placeholder="Scan or type Barcode / Tag No / Inventory Code and press Enter..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={handleBarcodeScan}
                      className="pl-10 h-10 text-xs font-semibold border-blue-300 bg-white shadow-inner focus-visible:ring-blue-500"
                    />
                  </div>
                  <Button onClick={handleBarcodeScan} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-10 text-xs font-semibold">
                    <ScanBarcode className="h-4 w-4" /> Scan & Add
                  </Button>
                </div>

                {/* STOCK DROPDOWN */}
                <div className="w-full md:w-80">
                  <select
                    className="h-10 w-full rounded-md border border-blue-300 bg-white px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const id = e.target.value;
                      if (id) {
                        const selected = availableInventories.find((inv) => String(inv.id) === String(id));
                        if (selected) addInventoryItem(selected);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">-- Or Select Available Stock --</option>
                    {availableInventories.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.barcodeNo || inv.inventoryCode} | {inv.item?.name || inv.product?.name} ({inv.netWeight || inv.grossWeight}g)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER & INVOICE HEADER DETAILS */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Customer & Invoice Information
                </h3>
                <span className="text-[11px] text-blue-600 font-semibold">
                  Place of Supply determines CGST+SGST (Intra-state) vs IGST (Inter-state)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                {/* CUSTOMER MASTER */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Customer Master</label>
                  <select
                    className="h-9 w-full rounded border border-slate-300 px-2.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                    value={state.partyId}
                    onChange={(e) => handlePartyChange(e.target.value)}
                  >
                    <option value="">-- Walk-in / New Customer --</option>
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} {p.phone ? `(${p.phone})` : ""}</option>
                    ))}
                  </select>
                </div>

                {/* CUSTOMER NAME */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter customer name"
                    value={state.customerName}
                    onChange={(e) => updateField("customerName", e.target.value)}
                    className={`h-9 text-xs ${validationErrors.customerName ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  {validationErrors.customerName && (
                    <span className="text-[10px] text-red-500 font-medium block mt-0.5">{validationErrors.customerName}</span>
                  )}
                </div>

                {/* CONTACT NUMBER */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Contact No.</label>
                  <Input
                    placeholder="10-digit mobile"
                    value={state.customerPhone}
                    maxLength={10}
                    onChange={(e) => updateField("customerPhone", e.target.value.replace(/\D/g, ""))}
                    className={`h-9 text-xs ${validationErrors.customerPhone ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  {validationErrors.customerPhone && (
                    <span className="text-[10px] text-red-500 font-medium block mt-0.5">{validationErrors.customerPhone}</span>
                  )}
                </div>

                {/* CITY */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">City</label>
                  <Input
                    placeholder="e.g. Bhubaneswar - 766001"
                    value={state.customerCity}
                    onChange={(e) => updateField("customerCity", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                {/* ADDRESS */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Address</label>
                  <Input
                    placeholder="Street / locality address"
                    value={state.customerAddress}
                    onChange={(e) => updateField("customerAddress", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                {/* PAN NUMBER */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Customer PAN No.</label>
                  <Input
                    placeholder="e.g. ABCDE1234F"
                    value={state.customerPan}
                    maxLength={10}
                    onChange={(e) => updateField("customerPan", e.target.value.toUpperCase())}
                    className={`h-9 text-xs uppercase ${validationErrors.customerPan ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  {validationErrors.customerPan && (
                    <span className="text-[10px] text-red-500 font-medium block mt-0.5">{validationErrors.customerPan}</span>
                  )}
                </div>

                {/* GSTIN */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Customer GSTIN</label>
                  <Input
                    placeholder="15-digit GSTIN"
                    value={state.customerGst}
                    maxLength={15}
                    onChange={(e) => updateField("customerGst", e.target.value.toUpperCase())}
                    className={`h-9 text-xs uppercase ${validationErrors.customerGst ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  {validationErrors.customerGst && (
                    <span className="text-[10px] text-red-500 font-medium block mt-0.5">{validationErrors.customerGst}</span>
                  )}
                </div>

                {/* PLACE OF SUPPLY */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    Place of Supply <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="State e.g. ODISHA"
                    value={state.placeOfSupply}
                    onChange={(e) => updateField("placeOfSupply", e.target.value.toUpperCase())}
                    className={`h-9 text-xs uppercase font-medium ${validationErrors.placeOfSupply ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  {validationErrors.placeOfSupply && (
                    <span className="text-[10px] text-red-500 font-medium block mt-0.5">{validationErrors.placeOfSupply}</span>
                  )}
                </div>

                {/* INVOICE DATE */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Invoice Date</label>
                  <Input
                    type="date"
                    value={state.saleDate}
                    onChange={(e) => updateField("saleDate", e.target.value)}
                    className="h-9 text-xs font-medium"
                  />
                </div>

                {/* STORE CIN */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Store CIN No.</label>
                  <Input
                    value={state.cinNo}
                    onChange={(e) => updateField("cinNo", e.target.value)}
                    className="h-9 text-xs text-slate-600"
                  />
                </div>

                {/* STORE GST */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Store GST No.</label>
                  <Input
                    value={state.storeGst}
                    onChange={(e) => updateField("storeGst", e.target.value)}
                    className="h-9 text-xs text-slate-600"
                  />
                </div>

                {/* IRN */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">IRN No. (Optional)</label>
                  <Input
                    placeholder="e-Invoice IRN"
                    value={state.irnNo}
                    onChange={(e) => updateField("irnNo", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. JEWELLERY ITEMS LIST (HORIZONTALLY SCROLLABLE TABLE) */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Jewellery Items List ({state.items.length})
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Total Gross: <strong className="text-slate-800">{weightStr(state.items.reduce((s, it) => s + Number(it.grossWeight || 0), 0))}g</strong> |
                    Total Net: <strong className="text-blue-700">{weightStr(state.items.reduce((s, it) => s + Number(it.netWeight || 0), 0))}g</strong>
                  </span>
                </div>
                {validationErrors.items && (
                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.items}
                  </span>
                )}
              </div>

              {/* HORIZONTAL SCROLL CONTAINER */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1460px] text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-center w-12 border-r border-slate-200">#</th>
                      <th className="p-2.5 text-left min-w-[180px] border-r border-slate-200">Particulars</th>
                      <th className="p-2.5 text-left min-w-[140px] border-r border-slate-200">Item Code / Barcode</th>
                      <th className="p-2.5 text-center w-28 border-r border-slate-200">HUID No.</th>
                      <th className="p-2.5 text-center w-24 border-r border-slate-200">HSN/SAC</th>
                      <th className="p-2.5 text-center w-20 border-r border-slate-200">Purity</th>
                      <th className="p-2.5 text-center w-16 border-r border-slate-200">Pcs</th>
                      <th className="p-2.5 text-right w-24 border-r border-slate-200">Gross Wt (g)</th>
                      <th className="p-2.5 text-right w-24 border-r border-slate-200">Net Wt (g)</th>
                      <th className="p-2.5 text-right w-28 border-r border-slate-200">Rate (₹/g)</th>
                      <th className="p-2.5 text-right w-36 border-r border-slate-200">Making Charges</th>
                      <th className="p-2.5 text-right w-24 border-r border-slate-200">Other Chg (₹)</th>
                      <th className="p-2.5 text-right w-24 border-r border-slate-200">Discount (₹)</th>
                      <th className="p-2.5 text-right w-28 border-r border-slate-200">Total (₹)</th>
                      <th className="p-2.5 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {state.items.length === 0 ? (
                      <tr>
                        <td colSpan={15} className="p-8 text-center text-slate-400 font-medium">
                          No jewellery items added yet. Please scan barcode or pick from stock dropdown above.
                        </td>
                      </tr>
                    ) : (
                      state.items.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/20 transition align-middle">
                          <td className="p-2 text-center font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              value={row.particulars}
                              onChange={(e) => updateItem(idx, "particulars", e.target.value)}
                              className="h-8 text-xs font-semibold focus-visible:ring-blue-500"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              value={row.itemCode}
                              readOnly
                              className="h-8 text-xs bg-slate-50 text-slate-600 font-mono"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              value={row.huidNo || ""}
                              placeholder="HUID"
                              onChange={(e) => updateItem(idx, "huidNo", e.target.value)}
                              className="h-8 text-xs text-center font-mono font-semibold text-blue-900 focus-visible:ring-blue-500"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              value={row.hsnCode}
                              onChange={(e) => updateItem(idx, "hsnCode", e.target.value)}
                              className="h-8 text-xs text-center"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              value={row.purityName}
                              onChange={(e) => updateItem(idx, "purityName", e.target.value)}
                              className="h-8 text-xs text-center font-semibold text-blue-900"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              type="number"
                              min="1"
                              value={row.pieces}
                              onChange={(e) => updateItem(idx, "pieces", Math.max(1, parseInt(e.target.value) || 1))}
                              className="h-8 text-xs text-center"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              type="number"
                              step="0.001"
                              min="0"
                              value={row.grossWeight}
                              onChange={(e) => updateItem(idx, "grossWeight", e.target.value)}
                              className="h-8 text-xs text-right"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              type="number"
                              step="0.001"
                              min="0"
                              value={row.netWeight}
                              onChange={(e) => updateItem(idx, "netWeight", e.target.value)}
                              className="h-8 text-xs text-right font-semibold text-blue-900"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.rate}
                              onChange={(e) => updateItem(idx, "rate", e.target.value)}
                              className="h-8 text-xs text-right font-medium"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <div className="flex items-center gap-1">
                              <select
                                className="h-8 rounded border border-slate-300 text-[10px] px-1 bg-white font-medium focus:ring-1 focus:ring-blue-500"
                                value={row.makingChargeType}
                                onChange={(e) => updateItem(idx, "makingChargeType", e.target.value)}
                              >
                                <option value="PERCENT">%</option>
                                <option value="PER_GRAM">/Gm</option>
                                <option value="FLAT">Flat</option>
                              </select>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={row.makingChargeType === "PERCENT" ? "19.99%" : "Amount"}
                                value={row.makingChargeRate || (row.makingChargeType === "FLAT" ? row.makingCharges : "")}
                                onChange={(e) => updateItem(idx, "makingChargeRate", e.target.value)}
                                className="h-8 text-xs text-right"
                              />
                            </div>
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.otherCharges}
                              onChange={(e) => updateItem(idx, "otherCharges", e.target.value)}
                              className="h-8 text-xs text-right"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.discount}
                              onChange={(e) => updateItem(idx, "discount", e.target.value)}
                              className="h-8 text-xs text-right text-red-600"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-blue-950 text-xs border-r border-slate-100">
                            ₹{money(row.totalAmount)}
                          </td>
                          <td className="p-2 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(idx)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. BOTTOM SECTION: PAYMENTS & HSN SUMMARY VS REAL JEWELLERY AMOUNT BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* LEFT 7 COLS: PAYMENTS, HSN SUMMARY & IN-WORDS */}
              <div className="lg:col-span-7 space-y-4">
                {/* PAYMENTS BOX */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Payment Mode & Transaction Details
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          payments: [...prev.payments, emptyPayment(0)],
                        }))
                      }
                      className="h-7 text-xs gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="h-3 w-3" /> Add Payment Row
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {state.payments.map((pRow, pIdx) => (
                      <div key={pIdx} className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 items-center text-xs">
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Mode</label>
                          <select
                            className="h-8 w-full rounded border border-slate-300 px-2 bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500"
                            value={pRow.paymentMode}
                            onChange={(e) => {
                              const val = e.target.value;
                              setState((prev) => ({
                                ...prev,
                                payments: prev.payments.map((p, i) =>
                                  i === pIdx ? { ...p, paymentMode: val } : p
                                ),
                              }));
                            }}
                          >
                            {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Channel / Wallet</label>
                          <select
                            className="h-8 w-full rounded border border-slate-300 px-2 bg-white text-xs focus:ring-1 focus:ring-blue-500"
                            value={pRow.paymentChannel}
                            onChange={(e) => {
                              const val = e.target.value;
                              setState((prev) => ({
                                ...prev,
                                payments: prev.payments.map((p, i) =>
                                  i === pIdx ? { ...p, paymentChannel: val } : p
                                ),
                              }));
                            }}
                          >
                            {PAYMENT_CHANNELS.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Paid Amount (₹) *</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Amount"
                            value={pRow.amount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setState((prev) => ({
                                ...prev,
                                payments: prev.payments.map((p, i) =>
                                  i === pIdx ? { ...p, amount: val } : p
                                ),
                              }));
                            }}
                            className="h-8 text-xs font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Tr. / Reference ID</label>
                          <Input
                            placeholder="e.g. 565708411501"
                            value={pRow.transactionId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setState((prev) => ({
                                ...prev,
                                payments: prev.payments.map((p, i) =>
                                  i === pIdx ? { ...p, transactionId: val, referenceNo: val } : p
                                ),
                              }));
                            }}
                            className="h-8 text-xs font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Description</label>
                            <Input
                              placeholder="e.g. UPI/QR RECEIPT"
                              value={pRow.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setState((prev) => ({
                                  ...prev,
                                  payments: prev.payments.map((p, i) =>
                                    i === pIdx ? { ...p, description: val } : p
                                  ),
                                }));
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          {state.payments.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setState((prev) => ({
                                  ...prev,
                                  payments: prev.payments.filter((_, i) => i !== pIdx),
                                }))
                              }
                              className="h-7 w-7 text-red-500 hover:text-red-700 mt-3"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button variant="ghost" size="sm" onClick={syncPaymentAmount} className="text-xs text-blue-600 hover:text-blue-700 font-semibold h-6">
                      Sync Net Payable into Payment (₹{money(calculations.netPayable)})
                    </Button>
                  </div>
                </div>

                {/* HSN / GST SUMMARY TABLE */}
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                    HSN / Tax Summary Table
                  </h3>
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-1.5">Sr.</th>
                        <th className="p-1.5">HSN/SAC</th>
                        <th className="p-1.5 text-right">CGST %</th>
                        <th className="p-1.5 text-right">CGST Amt (₹)</th>
                        <th className="p-1.5 text-right">SGST %</th>
                        <th className="p-1.5 text-right">SGST Amt (₹)</th>
                        <th className="p-1.5 text-right">IGST %</th>
                        <th className="p-1.5 text-right">IGST Amt (₹)</th>
                        <th className="p-1.5 text-right">Total Tax (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-1.5 font-semibold">1</td>
                        <td className="p-1.5 font-semibold text-blue-700">{state.items[0]?.hsnCode || "711319"}</td>
                        <td className="p-1.5 text-right">{Number(calculations.cgstPercent).toFixed(3)}%</td>
                        <td className="p-1.5 text-right font-medium">₹{money(calculations.cgstAmount)}</td>
                        <td className="p-1.5 text-right">{Number(calculations.sgstPercent).toFixed(3)}%</td>
                        <td className="p-1.5 text-right font-medium">₹{money(calculations.sgstAmount)}</td>
                        <td className="p-1.5 text-right">{Number(calculations.igstPercent).toFixed(2)}%</td>
                        <td className="p-1.5 text-right font-medium">₹{money(calculations.igstAmount)}</td>
                        <td className="p-1.5 text-right font-bold text-blue-900">₹{money(calculations.totalTax)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* IN WORDS & REMARKS */}
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Invoice Value [ In Words ] : </span>
                    <span className="font-semibold text-slate-900 italic">{calculations.inWords}</span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Narration / Remarks</label>
                    <Input
                      placeholder="Enter invoice remarks or narration..."
                      value={state.narration}
                      onChange={(e) => updateField("narration", e.target.value)}
                      className="h-8 text-xs focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT 5 COLS: INVOICE AMOUNT CALCULATION BREAKDOWN */}
              <div className="lg:col-span-5">
                <div className="rounded-lg border-2 border-blue-200 bg-white p-4 shadow-md space-y-2 text-xs">
                  <div className="bg-blue-50 text-blue-950 font-bold uppercase tracking-wider py-1.5 px-3 rounded text-center border border-blue-200">
                    Invoice Amount Calculation
                  </div>

                  <div className="space-y-1.5 divide-y divide-slate-100 pt-1">
                    {/* GROSS AMOUNT */}
                    <div className="flex justify-between py-1 font-medium">
                      <span className="text-slate-700">Gross Amount</span>
                      <span className="font-bold text-slate-900 text-sm">₹{money(calculations.grossAmount)}</span>
                    </div>

                    {/* OFFER DISCOUNT */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-red-600 font-medium">Offer Discount [-]</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={state.offerDiscount}
                        onChange={(e) => updateField("offerDiscount", e.target.value)}
                        className="w-28 h-7 text-right text-xs font-semibold text-red-600 focus-visible:ring-red-400"
                      />
                    </div>

                    {/* DISCOUNT */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-red-600 font-medium">Discount [-]</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={state.discount}
                        onChange={(e) => updateField("discount", e.target.value)}
                        className="w-28 h-7 text-right text-xs font-semibold text-red-600 focus-visible:ring-red-400"
                      />
                    </div>

                    {/* TAXABLE AMOUNT */}
                    <div className="flex justify-between py-1.5 font-bold bg-blue-50/60 px-2 rounded text-blue-950">
                      <span>Taxable Amount</span>
                      <span>₹{money(calculations.taxableAmount)}</span>
                    </div>

                    {/* CGST */}
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>CGST Amt. [ + ] ({calculations.cgstPercent}%)</span>
                      <span>₹{money(calculations.cgstAmount)}</span>
                    </div>

                    {/* SGST */}
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>SGST Amt. [ + ] ({calculations.sgstPercent}%)</span>
                      <span>₹{money(calculations.sgstAmount)}</span>
                    </div>

                    {/* IGST (IF INTER-STATE) */}
                    {calculations.igstPercent > 0 && (
                      <div className="flex justify-between py-1 text-slate-600">
                        <span>IGST Amt. [ + ] ({calculations.igstPercent}%)</span>
                        <span>₹{money(calculations.igstAmount)}</span>
                      </div>
                    )}

                    {/* SUB TOTAL */}
                    <div className="flex justify-between py-1.5 font-bold bg-slate-50 px-2 rounded text-slate-800">
                      <span>Sub Total</span>
                      <span>₹{money(calculations.subTotal)}</span>
                    </div>

                    {/* LESS URD */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-700 font-medium">Less URD [-]</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={state.lessUrd}
                        onChange={(e) => updateField("lessUrd", e.target.value)}
                        className="w-28 h-7 text-right text-xs font-medium focus-visible:ring-blue-500"
                      />
                    </div>

                    {/* ROUND OFF */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-700 font-medium">Round Off [ +/- ]</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={state.roundOff}
                        onChange={(e) => {
                          setState((prev) => ({
                            ...prev,
                            roundOff: e.target.value,
                            isManualRoundOff: true,
                          }));
                        }}
                        className="w-28 h-7 text-right text-xs font-medium focus-visible:ring-blue-500"
                      />
                    </div>

                    {/* NET PAYABLE HIGHLIGHT BANNER */}
                    <div className="flex justify-between py-2.5 px-3 rounded-md bg-blue-600 text-white font-extrabold text-base items-center shadow-sm">
                      <span>Net Payable</span>
                      <span>₹{money(calculations.netPayable)}</span>
                    </div>

                    {/* PAID AMOUNT */}
                    <div className="flex justify-between py-1 text-emerald-700 font-semibold">
                      <span>Paid Amount</span>
                      <span>₹{money(calculations.paidAmount)}</span>
                    </div>

                    {/* DUE AMOUNT */}
                    <div className="flex justify-between py-1 text-red-600 font-bold">
                      <span>Due Amount</span>
                      <span>₹{money(calculations.dueAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* INVOICE PREVIEW MODAL */}
      <SalesInvoicePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        sale={previewSale}
      />
    </div>
  );
}


