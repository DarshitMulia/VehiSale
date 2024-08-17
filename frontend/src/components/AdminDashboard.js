import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import '../styles/admindashboard.css';
import '../styles/productlist.css';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [rejectedProducts, setRejectedProducts] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedProductId, setSelectedProductId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user.isAdmin) {
            navigate('/');
        }
    }, [navigate]);

    const refreshPageOnce = () => {
        const refreshed = localStorage.getItem('refreshed');
        if (!refreshed) {
            localStorage.setItem('refreshed', 'true');
            window.location.reload();
        }
    };

    useEffect(() => {
        refreshPageOnce();
        getProducts();
        getPendingProducts();
    }, []);

    useEffect(() => {
        return () => {
            localStorage.removeItem('refreshed');
        };
    }, []);

    const getProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/products', {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                console.error('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const getPendingProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/pending-products', {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPendingProducts(data);
            } else {
                console.error('Failed to fetch pending products');
            }
        } catch (error) {
            console.error('Error fetching pending products:', error);
        }
    };

    const approveProduct = async (id) => {
        try {
            const token = JSON.parse(localStorage.getItem('token'));

            const response = await fetch(`http://localhost:5000/pending-products/approve-reject/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${token}`
                },
                body: JSON.stringify({ action: 'approve' })
            });

            if (response.ok) {
                const pendingProduct = pendingProducts.find(product => product._id === id);

                if (!pendingProduct.userId) {
                    console.error('User ID not found in pending product data.');
                    return;
                }

                const newProduct = {
                    name: pendingProduct.name,
                    price: pendingProduct.price,
                    category: pendingProduct.category,
                    company: pendingProduct.company,
                    image: pendingProduct.image,
                    year: pendingProduct.year,
                    mileage: pendingProduct.mileage,
                    color: pendingProduct.color,
                    transmission: pendingProduct.transmission,
                    fuelType: pendingProduct.fuelType,
                    userId: pendingProduct.userId
                };

                setProducts([...products, newProduct]);

                setPendingProducts(pendingProducts.filter(product => product._id !== id));
            } else {
                const errorMessage = await response.text();
                console.error('Failed to approve product:', errorMessage);
            }
        } catch (error) {
            console.error('Error approving product:', error);
        }
    };

    const handleRejectClick = (id) => {
        setSelectedProductId(id);
        setModalIsOpen(true);
    };

    const rejectProduct = async () => {
        try {
            const response = await fetch(`http://localhost:5000/pending-products/approve-reject/${selectedProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`
                },
                body: JSON.stringify({ action: 'reject', reason: rejectionReason })
            });
            if (response.ok) {
                const pendingProduct = pendingProducts.find(product => product._id === selectedProductId);

                const rejectedProduct = {
                    name: pendingProduct.name,
                    price: pendingProduct.price,
                    category: pendingProduct.category,
                    company: pendingProduct.company,
                    image: pendingProduct.image,
                    year: pendingProduct.year,
                    mileage: pendingProduct.mileage,
                    color: pendingProduct.color,
                    transmission: pendingProduct.transmission,
                    fuelType: pendingProduct.fuelType,
                    userId: pendingProduct.userId
                };

                setRejectedProducts([...rejectedProducts, rejectedProduct]);

                setPendingProducts(pendingProducts.filter(product => product._id !== selectedProductId));

                setModalIsOpen(false);
                setRejectionReason('');
                setSelectedProductId(null);
            } else {
                console.error('Failed to reject product');
            }
        } catch (error) {
            console.error('Error rejecting product:', error);
        }
    };

    return (
        <div className="product-list-container">
            <div style={{ backgroundColor: "#f1f1f1", padding: "20px" }}>
                <center><h1 style={{ color: "#434343" }}>Pending Car Requests</h1></center>
                <div className="border"></div>
                <div className="product-cards">
                    {pendingProducts.length > 0 ? (
                        pendingProducts.map((item, index) => (
                            <div key={item._id} className="product-card">
                                <div className="product-image">
                                    <img src={`data:image/jpeg;base64,${item.image}`} alt={item.name} />
                                </div>
                                <div className="product-details-first-line">
                                    <h4>{item.name}</h4>
                                    <p>{item.company}</p>
                                    <p>{item.year}</p>
                                </div>
                                <div className="product-details">
                                    <table>
                                        <tr>
                                            <td><strong>Category</strong></td>
                                            <td>:</td>
                                            <td> {item.category}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Mileage</strong></td>
                                            <td>:</td>
                                            <td> {item.mileage}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Color</strong></td>
                                            <td>:</td>
                                            <td> {item.color}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Transmission</strong></td>
                                            <td>:</td>
                                            <td> {item.transmission}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Fuel Type</strong></td>
                                            <td>:</td>
                                            <td> {item.fuelType}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Price</strong></td>
                                            <td>:</td>
                                            <td> ₹ {item.price}</td>
                                        </tr>
                                    </table>
                                </div>
                                <div className="product-actions">
                                    <button className="reject-btn" onClick={() => handleRejectClick(item._id)}>REJECT</button>
                                    <button className="approve-btn" onClick={() => approveProduct(item._id)}>APPROVE</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-result-admin">No Result Found</p>
                    )}
                </div>

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    className={{
                        base: 'reject-product-modal',
                        afterOpen: 'reject-product-modal-open',
                        beforeClose: 'reject-product-modal-close'
                    }}
                    closeTimeoutMS={300}
                >
                    <div className="modal-content">
                        <h2 className="modal-header">Reject Product</h2>
                        <textarea
                            className="modal-textarea"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection"
                        />
                        <div className="modal-buttons">
                            <button className="modal-cancel-button" onClick={() => setModalIsOpen(false)}>Cancel</button>
                            <button className="modal-submit-button" onClick={rejectProduct}>Submit</button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default AdminDashboard;