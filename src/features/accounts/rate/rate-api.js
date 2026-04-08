let rates = [
  {
    id: 1,
    metal: "Gold",
    purity: "22K",
    grade: "A",
    unit: "Gram",
    saleRate: 6000,
    exchangeRate: 5900,
    cashRate: 6050,
  },
];

export const getRates = () => Promise.resolve(rates);

export const addRate = (data) => {
  data.id = rates.length + 1;
  rates.push(data);
  return Promise.resolve(data);
};

export const updateRate = (data) => {
  rates = rates.map((r) => (r.id === data.id ? data : r));
  return Promise.resolve(data);
};

export const deleteRate = (id) => {
  rates = rates.filter((r) => r.id !== id);
  return Promise.resolve();
};