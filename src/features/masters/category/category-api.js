let category = [
  { id: 1, name: "Gold", alias: "gold", description: "gold product" },
  { id: 2, name: "Silver", alias: "silver", description: "silver product" },
];

export const addCategory = (data) => {
        data.id =  category.length + 1;
        category.push(data);
        return Promise.resolve(data);

}

export const getCategory = () => {
    return Promise.resolve(category);
}

export const updatCategory = (data) => {
  category = category.map((b) => (b.id === data.id ? data : b));
  return Promise.resolve(data);
};

export const deleteCategory = (id) => {
  category = category.filter((b) => b.id !== id);
  return Promise.resolve();
};