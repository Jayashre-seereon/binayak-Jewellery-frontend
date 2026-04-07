let product = [
    {
        "id":1,
        "alias":"AU",
        "name":"dimond ring",
        "category":"Dimmond",
        "metal":"Dimond",
        "description":"blue stone dimond ring"
    },
    {
        "id":2,
        "alias":"LU",
        "name":"Gold ring",
        "category":"Gold",
        "metal":"Gold",
        "description":"blue stone gold ring"
    }
]


const getProduct = () => {
    return Promise.resolve(product);
}

const addProduct  = (data) => {
    data.id = product.length + 1;
    product.push(data);
    return Promise.resolve(data);
}

const updateProduct = (data) => {
    product = product.map((p) =>(p.id === data.id ? data : p));
    return Promise.resolve(data);
}

const deleteProduct = (id) => {
    product =  product.filter((p)=> p.id !== id );
    return Promise.resolve();
}
