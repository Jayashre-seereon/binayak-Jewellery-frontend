let oldPurchases = [];

export const getOldPurchases = () => Promise.resolve(oldPurchases);

export const addOldPurchase = (data) => {
  data.id = oldPurchases.length + 1;
  oldPurchases.push(data);
  return Promise.resolve(data);
};

export const deleteOldPurchase = (id) => {
  oldPurchases = oldPurchases.filter((p) => p.id !== id);
  return Promise.resolve();
};