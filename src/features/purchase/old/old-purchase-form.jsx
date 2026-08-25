import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onlyDecimal, onlyDigits, onlyAlphaNumeric } from "@/utils/validation";
import { getEmployees } from "@/api/employee-api";
import { getParties } from "@/api/party-api";
import { getMetals } from "@/api/metal-api";
import { getStones } from "@/api/stone-api";
import {
  PURCHASE_TYPES,
  PAYMENT_MODES,
  CUSTOMER_ID_TYPES,
} from "@/api/old-purchase-api";
import { getPuritiesByMetal } from "@/api/purity-api";
import { getGradesByPurity } from "@/api/grade-api";
import { getProductsByMetal } from "@/api/product-api";
import { getItemsByProduct } from "@/api/item-api";
import { getStonesByProductAndItem } from "@/api/stone-api";

const PAYMENT_CHANNELS = [
  "Cash",
  "PhonePe",
  "GooglePay",
  "PayTM",
  "BHIM UPI",
  "HDFC Bank",
  "SBI Bank",
  "ICICI Bank",
  "Axis Bank",
  "Net Banking",
  "Debit Card",
  "Credit Card",
  "Cheque",
  "Other",
];

const roundMoney = (v) => Math.round((Number(v || 0) + Number.EPSILON) * 100) / 100;
const roundWeight = (v) => Math.round((Number(v || 0) + Number.EPSILON) * 1000) / 1000;

const ITEM_FIELDS = [
  { key: "metalId", label: "Metal", kind: "select", options: "metals" },
  { key: "productId", label: "Product", kind: "select", options: "products" },
  { key: "itemId", label: "Item", kind: "select", options: "items" },
  { key: "purityId", label: "Purity", kind: "select", options: "purities" },
  { key: "gradeId", label: "Grade", kind: "select", options: "grades" },
  { key: "stoneId", label: "Stone", kind: "select", options: "stones" },
  { key: "pieces", label: "Pcs", kind: "number", step: "1", min: "1" },
  { key: "grossWeight", label: "Gross Wt", kind: "number", step: "0.001" },
  { key: "stoneWeight", label: "Stone Wt", kind: "number", step: "0.001" },
  { key: "netWeight", label: "Net Wt", kind: "calc" },
  { key: "rate", label: "Rate", kind: "number", step: "1" },
  { key: "metalAmount", label: "Metal Amt", kind: "calc", money: true },
  { key: "stoneAmount", label: "Stone Amt", kind: "number", step: "0.01" },
  { key: "otherAmount", label: "Other Amt", kind: "number", step: "0.01" },
  { key: "discount", label: "Discount", kind: "number", step: "0.01" },
  { key: "totalAmount", label: "Total", kind: "calc", money: true },
  { key: "hsnCode", label: "HSN/SAC", kind: "text" },
  { key: "huidNo", label: "HUID No.", kind: "text" },
  { key: "itemPhoto", label: "Photo", kind: "file" },
  { key: "narration", label: "Narration", kind: "text" },
];

function fieldsForType(purchaseType) {
  return ITEM_FIELDS.filter((f) => !f.types || f.types.includes(purchaseType));
}

let rowCounter = 1;

function createRow() {
  return {
    id: rowCounter++,
    metalId: "",
    productId: "",
    itemId: "",
    purityId: "",
    gradeId: "",
    stoneId: "",
    products: [],
    items: [],
    purities: [],
    grades: [],
    stones: [],
    pieces: 1,
    grossWeight: "",
    stoneWeight: "",
    netWeight: "",
    purity: "",
    rate: "",
    metalAmount: "",
    stoneAmount: "",
    otherAmount: "",
    discount: "",
    totalAmount: "",
    hsnCode: "711319",
    huidNo: "",
    narration: "",
    itemPhoto: null,
  };
}

function calcRow(row) {
  const hasAnyInput =
    row.grossWeight !== "" ||
    row.stoneWeight !== "" ||
    row.rate !== "" ||
    row.stoneAmount !== "" ||
    row.otherAmount !== "" ||
    row.discount !== "";

  const pieces = Math.max(1, parseInt(row.pieces) || 1);
  const grossWeight = parseFloat(row.grossWeight) || 0;
  const stoneWeight = parseFloat(row.stoneWeight) || 0;
  const rate = parseFloat(row.rate) || 0;
  const stoneAmount = parseFloat(row.stoneAmount) || 0;
  const otherAmount = parseFloat(row.otherAmount) || 0;
  const discount = parseFloat(row.discount) || 0;

  const netWeight = roundWeight(Math.max(0, grossWeight - stoneWeight));
  const metalAmount = roundMoney(netWeight * rate);
  const totalAmount = roundMoney(Math.max(0, metalAmount + stoneAmount + otherAmount - discount));

  if (!hasAnyInput) {
    return {
      ...row,
      pieces,
      grossWeight: "",
      stoneWeight: "",
      rate: "",
      stoneAmount: "",
      otherAmount: "",
      discount: "",
      netWeight: "",
      metalAmount: "",
      totalAmount: "",
    };
  }

  return {
    ...row,
    pieces,
    grossWeight,
    stoneWeight,
    rate,
    stoneAmount,
    otherAmount,
    discount,
    netWeight,
    metalAmount,
    totalAmount,
  };
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.purities)) return value.purities;
  if (Array.isArray(value?.grades)) return value.grades;
  if (Array.isArray(value?.stones)) return value.stones;
  if (Array.isArray(value?.products)) return value.products;
  return [];
}

function toId(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function toFieldValue(value) {
  return value === undefined || value === null ? "" : String(value);
}

function normalizeDecimalInput(value = "") {
  const cleaned = String(value).replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const [wholePartRaw, ...fractionParts] = cleaned.split(".");
  const wholePart = wholePartRaw.replace(/^0+(?=\d)/, "") || "0";

  if (!fractionParts.length) {
    return wholePart;
  }

  const fractionPart = fractionParts.join("").replace(/\./g, "");
  return `${wholePart}.${fractionPart}`;
}

const emptyPayment = (defaultAmount = 0) => ({
  paymentMode: "CASH",
  paymentChannel: "Cash",
  amount: defaultAmount,
  transactionId: "",
  referenceNo: "",
  description: "Direct Payment",
  paymentDate: new Date().toISOString().slice(0, 10),
  narration: "",
});

function buildInitialForm(defaultValues) {
  const today = new Date().toISOString().split("T")[0];
  if (!defaultValues) {
    return {
      purchaseType: "OLD",
      employeeId: "",
      partyId: "",
      customerName: "",
      customerPhone: "",
      customerIdType: "",
      customerIdNumber: "",
      address: "",
      placeOfSupply: "",
      isRCM: false,
      referenceNo: "",
      referenceDate: today,
      date: today,
      paymentMode: "CASH",
      paidAmount: "",
      discount: "",
      igst: "",
      cgst: "",
      sgst: "",
      taxAmount: "",
      roundOff: "",
      narration: "",
      document: null,
    };
  }

  return {
    purchaseType: defaultValues.purchaseType || "OLD",
    employeeId: defaultValues.employeeId || "",
    partyId: defaultValues.partyId || "",
    customerName: defaultValues.customerName || "",
    customerPhone: defaultValues.customerPhone || "",
    customerIdType: defaultValues.customerIdType || "",
    customerIdNumber: defaultValues.customerIdNumber || "",
    address: defaultValues.address || "",
    placeOfSupply: defaultValues.placeOfSupply || "",
    isRCM: Boolean(defaultValues.isRCM),
    referenceNo: defaultValues.referenceNo || "",
    referenceDate: defaultValues.referenceDate ? String(defaultValues.referenceDate).split("T")[0] : today,
    date: defaultValues.date ? String(defaultValues.date).split("T")[0] : today,
    paymentMode: defaultValues.paymentMode || "CASH",
    paidAmount: defaultValues.paidAmount ?? "",
    discount: defaultValues.discount ?? "",
    igst: defaultValues.igst ?? "",
    cgst: defaultValues.cgst ?? "",
    sgst: defaultValues.sgst ?? "",
    taxAmount: defaultValues.taxAmount ?? "",
    roundOff: defaultValues.roundOff ?? "",
    narration: defaultValues.narration || "",
    document: null,
  };
}

function buildInitialItems(defaultValues) {
  const rawItems = defaultValues?.items || defaultValues?.purchaseItems;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return [createRow()];
  }

  return rawItems.map((item, index) => ({
    id: item.id ?? index + 1,
    metalId: toId(item.metalId ?? item.metal?.id ?? item.product?.metalId ?? ""),
    productId: toId(item.productId ?? item.product?.id ?? item.stone?.productId ?? ""),
    itemId: toId(item.itemId ?? item.item?.id ?? item.stone?.itemId ?? ""),
    purityId: toId(item.purityId ?? item.purityMaster?.id ?? item.purity?.id ?? ""),
    gradeId: toId(item.gradeId ?? item.grade?.id ?? ""),
    stoneId: toId(item.stoneId ?? item.stone?.id ?? ""),
    products: [],
    items: [],
    purities: [],
    grades: [],
    stones: [],
    pieces: Math.max(1, Number(item.pieces || 1)),
    grossWeight: toFieldValue(item.grossWeight),
    stoneWeight: toFieldValue(item.stoneWeight),
    netWeight: item.netWeight ?? "",
    purity: toFieldValue(item.purity),
    rate: toFieldValue(item.rate),
    metalAmount: item.metalAmount ?? "",
    stoneAmount: toFieldValue(item.stoneAmount),
    otherAmount: toFieldValue(item.otherAmount),
    discount: toFieldValue(item.discount),
    totalAmount: item.totalAmount ?? "",
    hsnCode: toFieldValue(item.hsnCode) || "711319",
    huidNo: toFieldValue(item.huidNo),
    narration: toFieldValue(item.narration),
    itemPhoto: null,
  }));
}

function buildInitialPayments(defaultValues) {
  if (Array.isArray(defaultValues?.payments) && defaultValues.payments.length > 0) {
    return defaultValues.payments.map((p) => ({
      paymentMode: p.paymentMode || "CASH",
      paymentChannel: p.paymentChannel || "Cash",
      amount: Number(p.amount || 0),
      transactionId: p.transactionId || p.referenceNo || "",
      referenceNo: p.referenceNo || p.transactionId || "",
      description: p.description || "",
      paymentDate: p.paymentDate ? String(p.paymentDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
      narration: p.narration || "",
    }));
  }
  if (Number(defaultValues?.paidAmount || 0) > 0) {
    return [
      {
        paymentMode: defaultValues.paymentMode || "CASH",
        paymentChannel: "Cash",
        amount: Number(defaultValues.paidAmount),
        transactionId: "",
        referenceNo: "",
        description: "Direct Payment",
        paymentDate: new Date().toISOString().slice(0, 10),
        narration: "",
      },
    ];
  }
  return [emptyPayment(0)];
}

async function hydrateRowOptions(row) {
  const next = { ...row };
  try {
    if (next.metalId) {
      const [purities, products] = await Promise.all([
        getPuritiesByMetal(next.metalId).catch(() => []),
        getProductsByMetal(next.metalId).catch(() => []),
      ]);
      next.purities = normalizeList(purities);
      next.products = normalizeList(products);
    }
    if (next.productId) {
      next.items = normalizeList(await getItemsByProduct(next.productId).catch(() => []));
    }
    if (next.productId && !next.itemId && next.items.length === 1) {
      next.itemId = toId(next.items[0].id);
    }
    if (next.purityId) {
      next.grades = normalizeList(await getGradesByPurity(next.purityId).catch(() => []));
    }
    if (next.productId && next.itemId) {
      next.stones = normalizeList(await getStonesByProductAndItem(next.productId, next.itemId).catch(() => []));
    }
  } catch (e) {
    console.error("Hydrate error:", e);
  }
  return calcRow(next);
}

export default function OldPurchaseForm({ open, setOpen, onSave, defaultValues }) {
  const [form, setForm] = useState(buildInitialForm(defaultValues));
  const [items, setItems] = useState(() => buildInitialItems(defaultValues));
  const [payments, setPayments] = useState(() => buildInitialPayments(defaultValues));
  const [options, setOptions] = useState({ employees: [], parties: [], metals: [], stones: [] });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [employees, parties, metals, stones] = await Promise.all([
          getEmployees().catch(() => []),
          getParties().catch(() => []),
          getMetals().catch(() => []),
          getStones().catch(() => []),
        ]);
        const nextForm = buildInitialForm(defaultValues);
        const seededItems = buildInitialItems(defaultValues);
        const seededPayments = buildInitialPayments(defaultValues);
        const hydratedItems = await Promise.all(seededItems.map((row) => hydrateRowOptions(row)));
        if (!active) return;
        setForm(nextForm);
        setItems(hydratedItems.length > 0 ? hydratedItems : [createRow()]);
        setPayments(seededPayments);
        setOptions({
          employees: normalizeList(employees),
          parties: normalizeList(parties),
          metals: normalizeList(metals),
          stones: normalizeList(stones),
        });
      } catch (err) {
        console.error("Options error:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, defaultValues]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePartyChange = (pId) => {
    setErrors((prev) => ({ ...prev, partyId: null, customerName: null, customerPhone: null }));
    if (!pId) {
      setForm((prev) => ({
        ...prev,
        partyId: "",
      }));
      return;
    }
    const party = options.parties.find((p) => String(p.id) === String(pId));
    if (party) {
      setForm((prev) => ({
        ...prev,
        partyId: pId,
        customerName: party.name || prev.customerName,
        customerPhone: party.phone || prev.customerPhone,
        address: party.address || prev.address,
        placeOfSupply: party.state || prev.placeOfSupply || "ODISHA",
      }));
    }
  };

  const addRow = () => setItems((prev) => [...prev, createRow()]);
  const deleteRow = (id) => setItems((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        let next = { ...row, [field]: value };

        if (field === "metalId") {
          next = {
            ...next,
            productId: "",
            itemId: "",
            purityId: "",
            gradeId: "",
            stoneId: "",
            products: [],
            items: [],
            purities: [],
            grades: [],
            stones: [],
          };
          getPuritiesByMetal(value).then((purities) => {
            setItems((rows) => rows.map((r) => (r.id === id ? { ...r, purities: normalizeList(purities) } : r)));
          });
          getProductsByMetal(value).then((products) => {
            setItems((rows) => rows.map((r) => (r.id === id ? { ...r, products: normalizeList(products) } : r)));
          });
        }

        if (field === "productId") {
          next = { ...next, itemId: "", stoneId: "", items: [], stones: [] };
          getItemsByProduct(value).then((itemsList) => {
            setItems((rows) => rows.map((r) => (r.id === id ? { ...r, items: normalizeList(itemsList) } : r)));
          });
        }

        if (field === "itemId") {
          next = { ...next, stoneId: "", stones: [] };
          if (next.productId && value) {
            getStonesByProductAndItem(next.productId, value).then((stones) => {
              setItems((rows) => rows.map((r) => (r.id === id ? { ...r, stones: normalizeList(stones) } : r)));
            });
          }
        }

        if (field === "purityId") {
          next = { ...next, gradeId: "" };
          getGradesByPurity(value).then((grades) => {
            setItems((rows) => rows.map((r) => (r.id === id ? { ...r, grades: normalizeList(grades) } : r)));
          });
        }

        if (field === "gradeId") {
          const gradeList = normalizeList(row.grades);
          const g = gradeList.find((grade) => String(grade.id) === String(value));
          if (g && !next.purity) next.purity = g.percentage;
        }

        return calcRow(next);
      })
    );
  };

  // Payment handlers
  const addPaymentRow = () => setPayments((prev) => [...prev, emptyPayment(0)]);
  const removePaymentRow = (idx) => setPayments((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : [emptyPayment(0)]));
  const updatePaymentRow = (idx, field, val) => setPayments((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));

  const totalPieces = items.reduce((s, r) => s + (parseInt(r.pieces) || 1), 0);
  const totalGross = items.reduce((s, r) => s + (parseFloat(r.grossWeight) || 0), 0);
  const totalNet = items.reduce((s, r) => s + (parseFloat(r.netWeight) || 0), 0);
  const subTotal = items.reduce((s, r) => s + (parseFloat(r.totalAmount) || 0), 0);
  const invoiceDiscount = parseFloat(form.discount) || 0;
  const taxableAmount = Math.max(0, subTotal - invoiceDiscount);

  const isInterState =
    form.placeOfSupply &&
    form.placeOfSupply.trim().toUpperCase() !== "ODISHA" &&
    form.placeOfSupply.trim().toUpperCase() !== "";

  const autoIGST = isInterState ? roundMoney((taxableAmount * 3.0) / 100) : 0;
  const autoCGST = !isInterState ? roundMoney((taxableAmount * 1.5) / 100) : 0;
  const autoSGST = !isInterState ? roundMoney((taxableAmount * 1.5) / 100) : 0;

  const manualIGST = parseFloat(form.igst);
  const manualCGST = parseFloat(form.cgst);
  const manualSGST = parseFloat(form.sgst);
  const manualTax = parseFloat(form.taxAmount);
  const manualRoundOff = parseFloat(form.roundOff);

  const igst = !isNaN(manualIGST) && form.igst !== "" ? manualIGST : autoIGST;
  const cgst = !isNaN(manualCGST) && form.cgst !== "" ? manualCGST : autoCGST;
  const sgst = !isNaN(manualSGST) && form.sgst !== "" ? manualSGST : autoSGST;
  const taxAmount = !isNaN(manualTax) && form.taxAmount !== "" ? manualTax : roundMoney(igst + cgst + sgst);

  const rawSubTotal = roundMoney(taxableAmount + taxAmount);
  const autoRoundOff = roundMoney(Math.round(rawSubTotal) - rawSubTotal);
  const roundOff = !isNaN(manualRoundOff) && form.roundOff !== "" ? manualRoundOff : autoRoundOff;
  const grandTotal = roundMoney(rawSubTotal + roundOff);

  const paidAmount = roundMoney(payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0));
  const dueAmount = roundMoney(Math.max(0, grandTotal - paidAmount));

  const syncPaymentAmount = () => {
    setPayments([
      {
        paymentMode: payments[0]?.paymentMode || "CASH",
        paymentChannel: payments[0]?.paymentChannel || "Cash",
        amount: grandTotal,
        transactionId: payments[0]?.transactionId || "",
        referenceNo: payments[0]?.referenceNo || "",
        description: "Full Purchase Settlement",
        paymentDate: new Date().toISOString().slice(0, 10),
        narration: "",
      },
    ]);
  };

  const visibleFields = fieldsForType(form.purchaseType);
  const selectCls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  const renderCell = (row, field) => {
    if (field.kind === "calc") {
      return <div className="text-sm font-medium px-1">{field.money ? "₹" : ""}{Number(row[field.key] || 0).toFixed(field.money ? 2 : 3)}</div>;
    }
    if (field.kind === "select") {
      const list = normalizeList(row[field.options] ?? options[field.options]);
      return (
        <select
          className={selectCls}
          value={row[field.key]}
          onChange={(e) => updateItem(row.id, field.key, e.target.value)}
        >
          <option value="">Select</option>
          {list.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      );
    }

    if (field.kind === "file") {
      return (
        <Input
          type="file"
          onChange={(e) => updateItem(row.id, field.key, e.target.files?.[0] ?? null)}
        />
      );
    }

    const inputType = field.kind === "number" ? "text" : "text";
    const handleNumberChange = (e) => {
      const normalized = normalizeDecimalInput(e.target.value);
      updateItem(row.id, field.key, normalized);
    };

    return (
      <Input
        type={inputType}
        inputMode={field.kind === "number" ? "decimal" : undefined}
        pattern={field.kind === "number" ? "[0-9]*[.]?[0-9]*" : undefined}
        step={field.step}
        value={row[field.key]}
        onChange={field.kind === "number" ? handleNumberChange : (e) => updateItem(row.id, field.key, e.target.value)}
      />
    );
  };

  const handleSave = () => {
    const nextErrors = {};
    const referenceNo = (form.referenceNo || "").trim();
    const customerName = (form.customerName || "").trim();
    const customerPhone = String(form.customerPhone || "").trim();
    const customerIdType = String(form.customerIdType || "").trim();
    const customerIdNumber = String(form.customerIdNumber || "").trim();

    if (!form.partyId && !customerName) {
      nextErrors.customerName = "Customer name or Party is required.";
    }
    if (customerPhone && !/^\d{10}$/.test(customerPhone)) {
      nextErrors.customerPhone = "Phone must be exactly 10 digits.";
    }
    if (customerIdType && !customerIdNumber) {
      nextErrors.customerIdNumber = "ID number is required when ID type is selected.";
    }
    if (!form.date) nextErrors.date = "Date is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      purchaseType: form.purchaseType,
      partyId: form.partyId ? Number(form.partyId) : undefined,
      employeeId: form.employeeId ? Number(form.employeeId) : undefined,
      date: form.date,
      referenceNo: form.referenceNo,
      referenceDate: form.referenceDate,
      address: form.address,
      placeOfSupply: form.placeOfSupply,
      isRCM: form.isRCM,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerIdType: form.customerIdType,
      customerIdNumber: form.customerIdNumber,
      grossAmount: subTotal,
      taxableAmount,
      subtotal: rawSubTotal,
      discount: invoiceDiscount,
      igst,
      cgst,
      sgst,
      taxAmount,
      roundOff,
      totalAmount: grandTotal,
      netPayable: grandTotal,
      paymentMode: payments[0]?.paymentMode || "CASH",
      paidAmount,
      dueAmount,
      narration: form.narration,
      payments: payments
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
      items: items.map(({ id, itemPhoto, products, items, purities, grades, stones, tagNo, ...rest }) => ({
        ...rest,
        pieces: Math.max(1, Number(rest.pieces || 1)),
        grossWeight: Number(rest.grossWeight || 0),
        stoneWeight: Number(rest.stoneWeight || 0),
        netWeight: Number(rest.netWeight || 0),
        rate: Number(rest.rate || 0),
        metalAmount: Number(rest.metalAmount || 0),
        stoneAmount: Number(rest.stoneAmount || 0),
        otherAmount: Number(rest.otherAmount || 0),
        discount: Number(rest.discount || 0),
        totalAmount: Number(rest.totalAmount || 0),
        hsnCode: rest.hsnCode || "711319",
        huidNo: rest.huidNo || null,
      })),
    };

    const fd = new FormData();
    fd.append("data", JSON.stringify(payload));
    if (form.document) fd.append("document", form.document);
    items.forEach((row) => {
      if (row.itemPhoto) fd.append("itemPhotos", row.itemPhoto);
    });

    onSave?.(fd);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!w-[95vw] !max-w-[1400px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase</DialogTitle>
        </DialogHeader>

        <div className="border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Purchase Type</label>
              <select className={selectCls} value={form.purchaseType} onChange={(e) => updateForm("purchaseType", e.target.value)}>
                {PURCHASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Employee</label>
              <select className={selectCls} value={form.employeeId} onChange={(e) => updateForm("employeeId", e.target.value)}>
                <option value="">Select</option>
                {options.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Reference No.</label>
              <Input
                value={form.referenceNo}
                onChange={(e) => updateForm("referenceNo", onlyAlphaNumeric(e.target.value))}
                placeholder="Reference No."
              />
              {errors.referenceNo ? <p className="text-xs text-red-500">{errors.referenceNo}</p> : null}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Date</label>
              <Input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} />
              {errors.date ? <p className="text-xs text-red-500">{errors.date}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Party / Customer Master</label>
              <select className={selectCls} value={form.partyId} onChange={(e) => handlePartyChange(e.target.value)}>
                <option value="">-- Walk-in / New Customer --</option>
                {options.parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.phone ? `(${p.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Customer Name <span className="text-destructive">*</span></label>
              <Input value={form.customerName} onChange={(e) => updateForm("customerName", e.target.value)} placeholder="Customer name" />
              {errors.customerName ? <p className="text-xs text-red-500">{errors.customerName}</p> : null}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Phone</label>
              <Input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.customerPhone}
                onChange={(e) => updateForm("customerPhone", onlyDigits(e.target.value).slice(0, 10))}
              />
              {errors.customerPhone ? <p className="text-xs text-red-500">{errors.customerPhone}</p> : null}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">ID Type</label>
              <select className={selectCls} value={form.customerIdType} onChange={(e) => updateForm("customerIdType", e.target.value)}>
                <option value="">Select</option>
                {CUSTOMER_ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">ID Number</label>
              <Input
                value={form.customerIdNumber}
                onChange={(e) => updateForm("customerIdNumber", onlyAlphaNumeric(e.target.value))}
                placeholder="ID Number"
              />
              {errors.customerIdNumber ? <p className="text-xs text-red-500">{errors.customerIdNumber}</p> : null}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">IGST</label>
              <Input type="number" value={form.igst} onChange={(e) => updateForm("igst", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">CGST</label>
              <Input type="number" value={form.cgst} onChange={(e) => updateForm("cgst", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">SGST</label>
              <Input type="number" value={form.sgst} onChange={(e) => updateForm("sgst", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tax Amount</label>
              <Input type="number" value={form.taxAmount} onChange={(e) => updateForm("taxAmount", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Round Off</label>
              <Input type="number" value={form.roundOff} onChange={(e) => updateForm("roundOff", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-xs text-muted-foreground">Address</label>
              <Input value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Place of Supply</label>
              <Input value={form.placeOfSupply} onChange={(e) => updateForm("placeOfSupply", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Document</label>
              <Input type="file" onChange={(e) => updateForm("document", e.target.files?.[0] ?? null)} />
            </div>
          </div>

         
        </div>

        <div className="border rounded-lg mt-2">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-medium text-sm">
              Items <span className="text-xs text-muted-foreground">({form.purchaseType})</span>
            </h2>
            <Button size="sm" onClick={addRow} disabled={loading}>+ Add</Button>
          </div>

          <div className="space-y-4 p-4">
            {items.map((row, index) => (
              <div key={row.id} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Item {index + 1}</h3>
                  {items.length > 1 && (
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:bg-destructive/10" onClick={() => deleteRow(row.id)}>
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {visibleFields.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-xs text-muted-foreground">{f.label}</label>
                      {renderCell(row, f)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Payment Details</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" type="button" onClick={syncPaymentAmount} className="h-7 text-xs">
                  Sync Net Payable
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={addPaymentRow} className="h-7 text-xs">
                  + Add Mode
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {payments.map((pmt, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                  <select className={selectCls} value={pmt.paymentMode} onChange={(e) => updatePaymentRow(idx, "paymentMode", e.target.value)}>
                    {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className={selectCls} value={pmt.paymentChannel} onChange={(e) => updatePaymentRow(idx, "paymentChannel", e.target.value)}>
                    {PAYMENT_CHANNELS.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
                  </select>
                  <Input type="text" inputMode="decimal" placeholder="Paid Amount" value={pmt.amount} onChange={(e) => updatePaymentRow(idx, "amount", normalizeDecimalInput(e.target.value))} />
                  <div className="flex gap-1">
                    <Input placeholder="Txn / Ref No." value={pmt.transactionId} onChange={(e) => updatePaymentRow(idx, "transactionId", e.target.value)} />
                    {payments.length > 1 && (
                      <Button size="sm" variant="ghost" type="button" onClick={() => removePaymentRow(idx)} className="h-9 px-2 text-destructive">
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input type="text" inputMode="decimal" placeholder="Discount" value={form.discount} onChange={(e) => updateForm("discount", normalizeDecimalInput(e.target.value))} />
              <Input placeholder="Narration" value={form.narration} onChange={(e) => updateForm("narration", e.target.value)} />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-1">
            {[
              { label: "Total Gross Wt", value: `${totalGross.toFixed(3)} gm` },
              { label: "Total Net Wt", value: `${totalNet.toFixed(3)} gm` },
              { label: "Total Pieces (Pcs)", value: `${totalPieces}` },
              { label: "Gross Item Amount", value: `₹${subTotal.toFixed(2)}` },
              { label: "Taxable Amount", value: `₹${taxableAmount.toFixed(2)}` },
              { label: isInterState ? "IGST (3%)" : "CGST + SGST (3%)", value: `₹${taxAmount.toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{label}</span>
                <span>{value}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-sm border-t pt-2 mt-1">
              <span>Total Amount</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>Paid Amount</span>
              <span>₹{paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-destructive font-bold">
              <span>Due Amount</span>
              <span>₹{dueAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
