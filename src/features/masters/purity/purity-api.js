let purities = [
  { id: 1, alias: "22K", name: "22 Karat", metal: "Gold", description: "916 Gold" },
  { id: 2, alias: "18K", name: "18 Karat", metal: "Gold", description: "750 Gold" },
];

export const getPurities = () => {
  return Promise.resolve(purities);
};

export const addPurity = (data) => {
  data.id = purities.length + 1;
  purities.push(data);
  return Promise.resolve(data);
};

export const updatePurity = (data) => {
  purities = purities.map((p) => (p.id === data.id ? data : p));
  return Promise.resolve(data);
};

export const deletePurity = (id) => {
  purities = purities.filter((p) => p.id !== id);
  return Promise.resolve();
};