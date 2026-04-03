let brands = [
  { id: 1, alias: "TJ", name: "Tanishq Jewels", description: "Premium brand" },
  { id: 2, alias: "KJ", name: "Kalyan Jewellers", description: "Traditional jewellery" },
];

export const getBrands = () => Promise.resolve(brands);

export const addBrand = (data) => {
  data.id = brands.length + 1;
  brands.push(data);
  return Promise.resolve(data);
};

export const updateBrand = (data) => {
  brands = brands.map((b) => (b.id === data.id ? data : b));
  return Promise.resolve(data);
};

export const deleteBrand = (id) => {
  brands = brands.filter((b) => b.id !== id);
  return Promise.resolve();
};