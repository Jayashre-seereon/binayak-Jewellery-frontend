let sales = [];

export const getSales = () => Promise.resolve(sales);

export const addSales = (data) => {
  data.id = sales.length + 1;
  sales.push(data);
  return Promise.resolve(data);
};

export const updateSales = (data) => {
  sales = sales.map((s) => (s.id === data.id ? data : s));
  return Promise.resolve(data);
};

export const deleteSales = (id) => {
  sales = sales.filter((s) => s.id !== id);
  return Promise.resolve();
};