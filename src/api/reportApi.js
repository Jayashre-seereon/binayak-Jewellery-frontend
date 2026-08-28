import http from "@/api/axios";

export const getSalesReport = async (
  params = {}
) => {
  const res = await http.get(
    "/api/sales/report",
    {
      params,
    }
  );

  return res.data;
};

export const getPurchaseReport =
  async (params = {}) => {
    const res = await http.get(
      "/api/purchases/report",
      {
        params,
      }
    );

    return res.data;
  };