import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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
        <div class="product-details-container">
            <div class="product-details">
                <div class="row">
                    <div class="col">
                        <div class="productdetail-image">
                            <img src={`data:image/jpeg;base64,${product.image}`} alt={product.name} />
                        </div>
                    </div>
                    <div class="col">
                        <div class="product-info">
                            <h1 class="productdetail-name">{product.name}</h1>
                            <div class="product-specs">
                                <div class="card">
                                    <h2>Specifications</h2>
                                    <ul>
                                        <li><strong>Company:</strong> {product.company}</li>
                                        <li><strong>Year:</strong> {product.year}</li>
                                        <li><strong>Category:</strong> {product.category}</li>
                                        <li><strong>Mileage:</strong> {product.mileage} km/l</li>
                                        <li><strong>Color:</strong> {product.color}</li>
                                        <li><strong>Transmission:</strong> {product.transmission}</li>
                                        <li><strong>Fuel Type:</strong> {product.fuelType}</li>
                                    </ul>
                                </div>
                            </div>
                            <p class="product-price">₹{product.price}</p>
                            <button class="buy-now-button">Buy Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
