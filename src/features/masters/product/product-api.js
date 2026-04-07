let products = [
  {
    id: 1,
    alias: "RNG-001",
    name: "Gold Ring",
    category: "Ring",
    metal: "Gold",
    description: "Simple gold ring",
  },
];

export const getProducts = () => Promise.resolve(products);

export const addProduct = (data) => {
  data.id = products.length + 1;
  products.push(data);
  return Promise.resolve(data);
};

export const updateProduct = (data) => {
  products = products.map((p) => (p.id === data.id ? data : p));
  return Promise.resolve(data);
};

export const deleteProduct = (id) => {
  products = products.filter((p) => p.id !== id);
  return Promise.resolve();
};