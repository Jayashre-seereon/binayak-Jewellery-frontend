import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import ReportTable from "./reportTable";
import {
  getSalesReport,
  getPurchaseReport,
} from "@/api/reportApi";

const periodOptions = [
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "This Week", value: "THIS_WEEK" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
  { label: "This Quarter", value: "THIS_QUARTER" },
  { label: "Last Quarter", value: "LAST_QUARTER" },
  { label: "This Year", value: "THIS_YEAR" },
  { label: "Last Year", value: "LAST_YEAR" },
  { label: "Custom Range", value: "CUSTOM" },
];

const purchaseTypeOptions = [
  {
    label: "All Purchase Types",
    value: "",
  },
  {
    label: "Ornament",
    value: "ORNAMENT",
  },
  {
    label: "Old Jewellery",
    value: "OLD",
  },
  {
    label: "Bullion",
    value: "BULLION",
  },
];

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

export default function ReportPage() {
  const [activeTab, setActiveTab] =
    useState("sales");

  const [period, setPeriod] =
    useState("THIS_MONTH");

  const [purchaseType, setPurchaseType] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [data, setData] =
    useState([]);

  const [filteredData, setFilteredData] =
    useState([]);

  const [summary, setSummary] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);

      const params = {
        period,
      };

      if (period === "CUSTOM") {
        if (!fromDate || !toDate) {
          setData([]);
          setFilteredData([]);
          setSummary({});
          return;
        }

        params.fromDate = fromDate;
        params.toDate = toDate;
      }

      if (
        activeTab === "purchase" &&
        purchaseType
      ) {
        params.purchaseType =
          purchaseType;
      }

      let response;

      if (activeTab === "sales") {
        response =
          await getSalesReport(params);
      } else {
        response =
          await getPurchaseReport(params);
      }

      const records =
        response?.sales ||
        response?.purchases ||
        response?.records ||
        response?.data ||
        [];

      setData(records);
      setFilteredData(records);

      setSummary(
        response?.summary || {}
      );
    } catch (error) {
      console.error(
        "Report load error:",
        error
      );

      setData([]);
      setFilteredData([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      period === "CUSTOM" &&
      (!fromDate || !toDate)
    ) {
      return;
    }

    loadReport();
  }, [
    activeTab,
    period,
    purchaseType,
  ]);

  const applyFilter = () => {
    if (
      period === "CUSTOM" &&
      (!fromDate || !toDate)
    ) {
      return;
    }

    loadReport();
  };

  useEffect(() => {
    if (!search.trim()) {
      setFilteredData(data);
      return;
    }

    const searchText =
      search.toLowerCase();

    const result = data.filter(
      (record) => {
        const invoice =
          record.invoiceNo
            ?.toLowerCase()
            .includes(searchText);

        const customer =
          record.customerName
            ?.toLowerCase()
            .includes(searchText);

        const phone =
          String(
            record.customerPhone || ""
          ).includes(searchText);

        const party =
          record.party?.name
            ?.toLowerCase()
            .includes(searchText);

        return (
          invoice ||
          customer ||
          phone ||
          party
        );
      }
    );

    setFilteredData(result);
  }, [search, data]);

  const salesSummaryCards = [
    {
      title: "Total Sales",
      value: formatCurrency(
        summary.totalSales ||
          summary.netSales ||
          summary.totalAmount ||
          0
      ),
    },
    {
      title: "Total Invoices",
      value:
        summary.totalInvoices || 0,
    },
    {
      title: "Gross Amount",
      value: formatCurrency(
        summary.grossTotal ||
          summary.grossAmount ||
          0
      ),
    },
    {
      title: "Discount",
      value: formatCurrency(
        summary.totalDiscount || 0
      ),
    },
    {
      title: "GST",
      value: formatCurrency(
        summary.totalTax ||
          summary.taxAmount ||
          0
      ),
    },
    {
      title: "Net Sales",
      value: formatCurrency(
        summary.netSales ||
          summary.netAmount ||
          summary.payableAmount ||
          summary.totalSales ||
          0
      ),
    },
  ];

  const purchaseSummaryCards = [
    {
      title: "Total Purchase",
      value: formatCurrency(
        summary.totalPurchase ||
          summary.totalAmount ||
          0
      ),
    },
    {
      title: "Total Invoices",
      value:
        summary.totalInvoices || 0,
    },
    {
      title: "Total Items",
      value:
        summary.totalItems || 0,
    },
    {
      title: "Paid Amount",
      value: formatCurrency(
        summary.paidAmount || 0
      ),
    },
    {
      title: "Balance Amount",
      value: formatCurrency(
        summary.balanceAmount || 0
      ),
    },
    {
      title: "Net Purchase",
      value: formatCurrency(
        summary.netPurchase ||
          summary.totalPurchase ||
          summary.totalAmount ||
          0
      ),
    },
  ];

  const summaryCards =
    activeTab === "sales"
      ? salesSummaryCards
      : purchaseSummaryCards;

  return (
    <div className="w-full min-w-0 space-y-6 p-2 md:p-2">
      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">
          Reports
        </h1>

        <div className="flex gap-2">
          <Button
            variant={
              activeTab === "sales"
                ? "default"
                : "outline"
            }
            onClick={() => {
              setActiveTab("sales");
              setPurchaseType("");
              setSearch("");
            }}
          >
            Sales Report
          </Button>

          <Button
            variant={
              activeTab === "purchase"
                ? "default"
                : "outline"
            }
            onClick={() => {
              setActiveTab("purchase");
              setSearch("");
            }}
          >
            Purchase Report
          </Button>
        </div>
      </div>

      {/* FILTER */}

      <div className="w-full rounded-lg border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* PERIOD */}

          <div>
            <label className="text-xs font-medium">
              Period
            </label>

            <select
              className="mt-1 h-10 w-full rounded-md border bg-white px-3"
              value={period}
              onChange={(e) => {
                const value =
                  e.target.value;

                setPeriod(value);

                if (
                  value !== "CUSTOM"
                ) {
                  setFromDate("");
                  setToDate("");
                }
              }}
            >
              {periodOptions.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* FROM DATE */}

          {period === "CUSTOM" && (
            <div>
              <label className="text-xs font-medium">
                From Date
              </label>

              <Input
                type="date"
                className="mt-1"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }
              />
            </div>
          )}

          {/* TO DATE */}

          {period === "CUSTOM" && (
            <div>
              <label className="text-xs font-medium">
                To Date
              </label>

              <Input
                type="date"
                className="mt-1"
                value={toDate}
                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }
              />
            </div>
          )}

          {/* PURCHASE TYPE */}

          {activeTab === "purchase" && (
            <div>
              <label className="text-xs font-medium">
                Purchase Type
              </label>

              <select
                className="mt-1 h-10 w-full rounded-md border bg-white px-3"
                value={purchaseType}
                onChange={(e) =>
                  setPurchaseType(
                    e.target.value
                  )
                }
              >
                {purchaseTypeOptions.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* APPLY BUTTON */}

          <div className="flex items-end">
            <Button
              className="h-10 w-full"
              onClick={applyFilter}
              disabled={
                period === "CUSTOM" &&
                (!fromDate || !toDate)
              }
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {item.title}
            </p>

            <p className="mt-2 text-2xl font-bold">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* SEARCH */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder={
            activeTab === "sales"
              ? "Search invoice, customer or phone..."
              : "Search invoice, party or phone..."
          }
          className="w-full sm:w-80"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <span className="text-sm text-gray-500">
          {filteredData.length} records
        </span>
      </div>

      {/* TABLE */}

      <div className="w-full min-w-0 overflow-hidden rounded-lg border bg-white">
        <ReportTable
          type={activeTab}
          data={filteredData}
          loading={loading}
        />
      </div>
    </div>
  );
}