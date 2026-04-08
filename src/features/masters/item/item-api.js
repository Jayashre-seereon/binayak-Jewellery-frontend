let items = [
  {
    id: 1,
    alias: "ITM-001",
    name: "Gold Ring Fancy",
    product: "Gold Ring",
    design: "Ring",
  },
];

export const getItems = () => Promise.resolve(items);

export const addItem = (data) => {
  data.id = items.length + 1;
  items.push(data);
  return Promise.resolve(data);
};

export const updateItem = (data) => {
  items = items.map((i) => (i.id === data.id ? data : i));
  return Promise.resolve(data);
};

export const deleteItem = (id) => {
  items = items.filter((i) => i.id !== id);
  return Promise.resolve();
};