import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onlyDecimal, onlyDigits, onlyAlphaNumeric } from "@/utils/validation";
import {getEmployees} from "@/api/employee-api";
import{getParties} from "@/api/party-api";
import{getMetals} from "@/api/metal-api";
import{getStones} from "@/api/stone-api";
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

const ITEM_FIELDS = [
   { key: "metalId", label: "Metal", kind: "select", options: "metals" },
  { key: "productId", label: "Product", kind: "select", options: "products" },
  { key: "itemId", label: "Item", kind: "select", options: "items" },
  { key: "purityId", label: "Purity", kind: "select", options: "purities" },
  { key: "gradeId", label: "Grade", kind: "select", options: "grades" },
  { key: "stoneId", label: "Stone", kind: "select", options: "stones" },
  //{ key: "pieces", label: "Pcs", kind: "number" },
  { key: "grossWeight", label: "Gross Wt", kind: "number", step: "0.001" },
  { key: "stoneWeight", label: "Stone Wt", kind: "number", step: "0.001" },
  { key: "dustWeight", label: "Dust Wt", kind: "number", step: "0.001", types: ["OLD"] },
  { key: "deductionWeight", label: "Deduction Wt", kind: "number", step: "0.001", types: ["OLD"] },
  { key: "netWeight", label: "Net Wt", kind: "calc" },
  //{ key: "purity", label: "Purity %", kind: "number", step: "0.01" },
  { key: "touchPercentage", label: "Touch %", kind: "number", step: "0.01", types: ["OLD"] },
  { key: "fineness", label: "Fineness", kind: "number", step: "0.001", types: ["BULLION"] },
  { key: "pureWeight", label: "Pure Wt", kind: "calc" },
  { key: "rate", label: "Rate", kind: "number", step: "1" },
  { key: "makingCharges", label: "Making Charges", kind: "number", types: ["ORNAMENT"] },
  { key: "wastagePercentage", label: "Wastage %", kind: "number", types: ["ORNAMENT"] },
  { key: "hallmarkCharges", label: "Hallmark Charges", kind: "number", types: ["ORNAMENT"] },
  { key: "metalAmount", label: "Metal Amt", kind: "calc", money: true },
  { key: "stoneAmount", label: "Stone Amt", kind: "number", step: "0.01" },
  { key: "otherAmount", label: "Other Amt", kind: "number", step: "0.01" },
  { key: "discount", label: "Discount", kind: "number", step: "0.01" },
  { key: "totalAmount", label: "Total", kind: "calc", money: true },
  { key: "huidNo", label: "HUID No.", kind: "text", types: ["ORNAMENT"] },
  { key: "barSerialNo", label: "Bar Serial", kind: "text", types: ["BULLION"] },
  { key: "assayCertNo", label: "Assay Cert", kind: "text", types: ["BULLION"] },
  { key: "tagNo", label: "Tag No.", kind: "text" },
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
    pieces: "",
    grossWeight: "",
    stoneWeight: "",
    netWeight: 0,
    dustWeight: "",
    deductionWeight: "",
    purity: "",
    touchPercentage: "",
    fineness: "",
    pureWeight: 0,
    rate: "",
    makingCharges: "",
    wastagePercentage: "",
    hallmarkCharges: "",
    metalAmount: 0,
    stoneAmount: "",
    otherAmount: "",
    discount: "",
    totalAmount: 0,
    huidNo: "",
    tagNo: "",
    barSerialNo: "",
    assayCertNo: "",
    narration: "",
    itemPhoto: null,
  };
}

function calcRow(row) {
  const grossWeight = parseFloat(row.grossWeight) || 0;
  const stoneWeight = parseFloat(row.stoneWeight) || 0;
  const dustWeight = parseFloat(row.dustWeight) || 0;
  const deductionWeight = parseFloat(row.deductionWeight) || 0;
  const purity = parseFloat(row.purity) || 0;
  const touchPercentage = parseFloat(row.touchPercentage) || 0;
  const rate = parseFloat(row.rate) || 0;
  const makingCharges = parseFloat(row.makingCharges) || 0;
  const hallmarkCharges = parseFloat(row.hallmarkCharges) || 0;
  const stoneAmount = parseFloat(row.stoneAmount) || 0;
  const otherAmount = parseFloat(row.otherAmount) || 0;
  const discount = parseFloat(row.discount) || 0;
  const netWeight = grossWeight - stoneWeight - dustWeight - deductionWeight;
  const effectivePurity = purity || touchPercentage;
  const pureWeight = netWeight * (effectivePurity / 100);
  const metalAmount = pureWeight * rate;
  const totalAmount = metalAmount + stoneAmount + otherAmount + makingCharges + hallmarkCharges - discount;
  return { ...row, netWeight, pureWeight, metalAmount, totalAmount };
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

function pickNestedId(item, directKey, nestedKey) {
  return toId(item?.[directKey] ?? item?.[nestedKey]?.id ?? item?.[nestedKey]?.itemId ?? "");
}

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
    narration: defaultValues.narration || "",
    document: null,
  };
}

function buildInitialItems(defaultValues) {
  if (!Array.isArray(defaultValues?.items) || defaultValues.items.length === 0) {
    return [createRow()];
  }

  return defaultValues.items.map((item, index) => ({
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
    pieces: toFieldValue(item.pieces ?? ""),
    grossWeight: toFieldValue(item.grossWeight),
    stoneWeight: toFieldValue(item.stoneWeight),
    netWeight: item.netWeight ?? 0,
    dustWeight: toFieldValue(item.dustWeight),
    deductionWeight: toFieldValue(item.deductionWeight),
    purity: toFieldValue(item.purity),
    touchPercentage: toFieldValue(item.touchPercentage),
    fineness: toFieldValue(item.fineness),
    pureWeight: item.pureWeight ?? 0,
    rate: toFieldValue(item.rate),
    makingCharges: toFieldValue(item.makingCharges),
    wastagePercentage: toFieldValue(item.wastagePercentage),
    hallmarkCharges: toFieldValue(item.hallmarkCharges),
    metalAmount: item.metalAmount ?? 0,
    stoneAmount: toFieldValue(item.stoneAmount),
    otherAmount: toFieldValue(item.otherAmount),
    discount: toFieldValue(item.discount),
    totalAmount: item.totalAmount ?? 0,
    huidNo: toFieldValue(item.huidNo),
    tagNo: toFieldValue(item.tagNo),
    barSerialNo: toFieldValue(item.barSerialNo),
    assayCertNo: toFieldValue(item.assayCertNo),
    narration: toFieldValue(item.narration),
    itemPhoto: null,
  }));
}

async function hydrateRowOptions(row) {
  const next = { ...row };
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
  return next;
}

export default function OldPurchaseForm({ open, setOpen, onSave, defaultValues }) {
  const [form, setForm] = useState(buildInitialForm(defaultValues));
  const [items, setItems] = useState(buildInitialItems(defaultValues));
  const [options, setOptions] = useState({ employees: [], parties: [], metals: [] });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [employees, parties, metals, stones] = await Promise.all([
          getEmployees(),
          getParties(),
          getMetals(),
          getStones(),
        ]);
        const nextForm = buildInitialForm(defaultValues);
        const seededItems = buildInitialItems(defaultValues);
        const hydratedItems = await Promise.all(seededItems.map((row) => hydrateRowOptions(row)));
        if (!active) return;
        setForm(nextForm);
        setItems(hydratedItems);
        setOptions({
          employees: normalizeList(employees),
          parties: normalizeList(parties),
          metals: normalizeList(metals),
          stones: normalizeList(stones),
        });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, defaultValues]);

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const addRow = () => setItems((prev) => [...prev, createRow()]);
  const deleteRow = (id) => setItems((prev) => prev.filter((r) => r.id !== id));

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

  const totalGross = items.reduce((s, r) => s + (parseFloat(r.grossWeight) || 0), 0);
  const totalNet = items.reduce((s, r) => s + (r.netWeight || 0), 0);
  const totalPure = items.reduce((s, r) => s + (r.pureWeight || 0), 0);
  const subTotal = items.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const invoiceDiscount = parseFloat(form.discount) || 0;
  const grandTotal = subTotal - invoiceDiscount;
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
          <option value="">-</option>
          {list.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      );
    }
    if (field.kind === "file") {
      return <Input type="file" onChange={(e) => updateItem(row.id, field.key, e.target.files?.[0] ?? null)} />;
    }
    return (
      <Input
        type={field.kind === "number" ? "number" : "text"}
        step={field.step}
        value={row[field.key]}
        onChange={(e) => updateItem(row.id, field.key, e.target.value)}
      />
    );
  };

  const handleSave = () => {
    const nextErrors = {};
    const referenceNo = form.referenceNo.trim();
    const customerName = form.customerName.trim();
    const customerPhone = String(form.customerPhone || "").trim();
    const customerIdType = String(form.customerIdType || "").trim();
    const customerIdNumber = String(form.customerIdNumber || "").trim();

    if (!form.partyId) nextErrors.partyId = "Party is required.";
    if (!customerName) nextErrors.customerName = "Customer name is required.";
    if (referenceNo && !/^[A-Za-z0-9\s.-]+$/.test(referenceNo)) {
      nextErrors.referenceNo = "Reference No. can contain only letters, numbers, spaces, dots, and hyphens.";
    }
    if (customerPhone && !/^\d{10}$/.test(customerPhone)) {
      nextErrors.customerPhone = "Phone must be exactly 10 digits.";
    }
    if (customerIdType && !customerIdNumber) {
      nextErrors.customerIdNumber = "ID number is required when ID type is selected.";
    }
    if (customerIdNumber && !/^[A-Za-z0-9\s.-]+$/.test(customerIdNumber)) {
      nextErrors.customerIdNumber = "ID number can contain only letters, numbers, spaces, dots, and hyphens.";
    }
    if (!form.date) nextErrors.date = "Date is required.";
    if (!form.referenceDate) nextErrors.referenceDate = "Reference date is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      purchaseType: form.purchaseType,
      partyId: form.partyId || undefined,
      employeeId: form.employeeId || undefined,
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
      subtotal: subTotal,
      discount: invoiceDiscount,
      totalAmount: grandTotal,
      paymentMode: form.paymentMode,
      paidAmount: parseFloat(form.paidAmount) || 0,
      narration: form.narration,
      items: items.map(({ id, itemPhoto, products, items, purities, grades, stones, ...rest }) => rest),
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
              <label className="text-xs text-muted-foreground">Party</label>
              <select className={selectCls} value={form.partyId} onChange={(e) => updateForm("partyId", e.target.value)}>
                <option value="">Select</option>
                {options.parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.partyId ? <p className="text-xs text-red-500">{errors.partyId}</p> : null}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Customer Name <span className="text-destructive">*</span></label>
              <Input value={form.customerName} onChange={(e) => updateForm("customerName", e.target.value)} />
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

          <div className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-input" checked={form.isRCM} onChange={(e) => updateForm("isRCM", e.target.checked)} />
            <span className="text-xs text-muted-foreground">Reverse Charge (RCM)</span>
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
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:bg-destructive/10" onClick={() => deleteRow(row.id)}>
                    Remove
                  </Button>
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
            <h3 className="font-medium text-sm">Payment</h3>
            <div className="grid grid-cols-3 gap-2">
              <select className={selectCls} value={form.paymentMode} onChange={(e) => updateForm("paymentMode", e.target.value)}>
                {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <Input type="number" placeholder="Paid Amount" value={form.paidAmount} onChange={(e) => updateForm("paidAmount", onlyDecimal(e.target.value))} />
              <Input type="number" placeholder="Discount" value={form.discount} onChange={(e) => updateForm("discount", onlyDecimal(e.target.value))} />
            </div>
            <Input placeholder="Narration" value={form.narration} onChange={(e) => updateForm("narration", e.target.value)} />
          </div>

          <div className="border rounded-lg p-4 space-y-1">
            {[
              { label: "Total Gross Wt", value: `${totalGross.toFixed(3)} gm` },
              { label: "Total Net Wt", value: `${totalNet.toFixed(3)} gm` },
              { label: "Total Pure Wt", value: `${totalPure.toFixed(3)} gm` },
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
