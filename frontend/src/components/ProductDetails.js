import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/productdetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                let result = await fetch(`http://localhost:5000/products/${id}`, {
                    headers: {
                        authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                    }
                });
                if (!result.ok) {
                    throw new Error('Failed to fetch product details');
                }
                result = await result.json();
                setProduct(result);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    if (loading) {
        return <p className="loading-text">Loading...</p>;
    }

    if (error) {
        return <p className="error-text">Error: {error}</p>;
    }

    return (
        <div className='main-container'>
            <div className="product-details">
                <div className="row">
                    <div className="col">
                        <div className="productdetail-image">
                            <img src={`data:image/jpeg;base64,${product.image}`} alt={product.name} />
                        </div>
                    </div>
                    <div className="col">
                        <div className="product-info">
                            <h1 className="productdetail-name">{product.name}</h1>
                            <div className="product-specs">
                                <div className="card">
                                    <h2>Specifications</h2>
                                    <table className="specs-table">
                                        <tbody>
                                            <tr>
                                                <th>Company</th>
                                                <td>:</td>
                                                <td>{product.company}</td>
                                            </tr>
                                            <tr>
                                                <th>Year</th>
                                                <td>:</td>
                                                <td>{product.year}</td>
                                            </tr>
                                            <tr>
                                                <th>Category</th>
                                                <td>:</td>
                                                <td>{product.category}</td>
                                            </tr>
                                            <tr>
                                                <th>Mileage</th>
                                                <td>:</td>
                                                <td>{product.mileage} km/l</td>
                                            </tr>
                                            <tr>
                                                <th>Color</th>
                                                <td>:</td>
                                                <td>{product.color}</td>
                                            </tr>
                                            <tr>
                                                <th>Transmission</th>
                                                <td>:</td>
                                                <td>{product.transmission}</td>
                                            </tr>
                                            <tr>
                                                <th>Fuel Type</th>
                                                <td>:</td>
                                                <td>{product.fuelType}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <p className="product-price">₹{product.price}</p>
                            <button className="buy-now-button">Buy Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
