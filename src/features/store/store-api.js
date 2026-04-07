let stores = [
  { 
    id: 1, 
    name: "rasulgarh store", 
    location: "Bhubaneswar",
    address: "Rasulgarh, Bhubaneswar, Odisha",
    phone: "+91-674-2345678",
    email: "rasulgarh@binayakjewellery.com"
  },
  { 
    id: 2, 
    name: "saheed nagar store", 
    location: "Bhubaneswar",
    address: "Saheed Nagar, Bhubaneswar, Odisha",
    phone: "+91-674-3456789",
    email: "sahidnagar@binayakjewellery.com"
  },
];

export const getStores = () => Promise.resolve(stores);

export const addStore = (data) => {
  data.id = stores.length + 1;
  stores.push(data);
  return Promise.resolve(data);
};