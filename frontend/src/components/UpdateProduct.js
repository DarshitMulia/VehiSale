import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateProduct = () => {
    const [name, setName] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [company, setCompany] = React.useState('');
    // eslint-disable-next-line
    const [error, setError] = React.useState(false);
    const params = useParams();
    const navigate = useNavigate();

    const getProductDetails = async () => {
        let result = await fetch(`http://localhost:5000/product/${params.id}`,{
            headers:{
                authorization:`bearer ${JSON.parse(localStorage.getItem('token'))}`
            }
        });
        result = await result.json();
        setName(result.name);
        setPrice(result.price);
        setCategory(result.category);
        setCompany(result.company);
    };

    useEffect(() => {
        getProductDetails();
        // eslint-disable-next-line
    }, []);

    const updateProduct = async () => {
        if (!name || !price || !category || !company) {
            setError(true);
            return false;
        }

        try {
            let result = await fetch(`http://localhost:5000/product/${params.id}`, {
                method: "PUT",
                body: JSON.stringify({ name, price, category, company }),
                headers: {
                    "Content-Type": "application/json",
                    authorization:`bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });

            if (!result.ok) {
                throw new Error('Network response was not ok');
            }

            result = await result.json();
            console.log(result);
            navigate('/');
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };


    return (
        <div className="center-container">
            <div className="add-product-container">
                <h1>Update Product</h1>
                <div>
                    <input
                        type="text"
                        placeholder="Enter Product Name"
                        value={name}
                        onChange={(e) => { setName(e.target.value) }}
                        className="add-product-input"
                    />
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Enter Product Price"
                        value={price}
                        onChange={(e) => { setPrice(e.target.value) }}
                        className="add-product-input"
                    />
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Enter Product Category"
                        value={category}
                        onChange={(e) => { setCategory(e.target.value) }}
                        className="add-product-input"
                    />
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Enter Product Company"
                        value={company}
                        onChange={(e) => { setCompany(e.target.value) }}
                        className="add-product-input"
                    />
                </div>


                <button onClick={updateProduct} className="add-product-button">Update Product</button>
            </div>
        </div>
    );
};

export default UpdateProduct;
