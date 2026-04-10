let stock = [];

export const getStock = () => Promise.resolve(stock);

export const addStock = (data) => {
  data.id = stock.length + 1;
  stock.push(data);
  return Promise.resolve(data);
};

export const deleteStock = (id) => {
  stock = stock.filter((s) => s.id !== id);
  return Promise.resolve();
};