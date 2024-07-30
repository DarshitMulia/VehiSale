import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

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

                // Verify that the pendingProduct object includes the userId field
                if (!pendingProduct.userId) {
                    console.error('User ID not found in pending product data.');
                    return;
                }

                // Create a new product instance using pending product details
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

                // Add the new product to the products list
                setProducts([...products, newProduct]);

                // Remove the approved product from the pending products list
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

                // Create a new rejected product instance using pending product details
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

                // Add the new rejected product to the rejected products list
                setRejectedProducts([...rejectedProducts, rejectedProduct]);

                // Remove the rejected product from pending products
                setPendingProducts(pendingProducts.filter(product => product._id !== selectedProductId));

                // Close the modal and reset the reason
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




// import React, { useEffect, useState } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// const AdminDashboard = () => {
//     const [pendingProducts, setPendingProducts] = useState([]);
//     const [approvedProducts, setApprovedProducts] = useState([]);
//     const [rejectedProducts, setRejectedProducts] = useState([]);
//     const [testimonials, setTestimonials] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const token = localStorage.getItem('authToken'); // Assumes token is stored in local storage

//                 if (!token) {
//                     throw new Error("No authentication token found.");
//                 }

//                 const pendingProductsResponse = await fetch('http://localhost:5000/pending-products', {
//                     headers: {
//                         authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
//                     }
//                 });
//                 if (pendingProductsResponse.ok) {
//                     setPendingProducts(await pendingProductsResponse.json());
//                 } else {
//                     throw new Error('Failed to fetch pending products');
//                 }

//                 const approvedProductsResponse = await fetch('http://localhost:5000/products', {
//                     headers: {
//                         authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
//                     }
//                 });
//                 if (approvedProductsResponse.ok) {
//                     setApprovedProducts(await approvedProductsResponse.json());
//                 } else {
//                     throw new Error('Failed to fetch approved products');
//                 }

//                 const rejectedProductsResponse = await fetch('http://localhost:5000/rejected-products', {
//                     headers: {
//                         authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
//                     }
//                 });
//                 if (rejectedProductsResponse.ok) {
//                     setRejectedProducts(await rejectedProductsResponse.json());
//                 } else {
//                     throw new Error('Failed to fetch rejected products');
//                 }

//                 const testimonialsResponse = await fetch('http://localhost:5000/testimonials', {
//                     headers: {
//                         authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
//                     }
//                 });
//                 if (testimonialsResponse.ok) {
//                     setTestimonials(await testimonialsResponse.json());
//                 } else {
//                     throw new Error('Failed to fetch testimonials');
//                 }

//                 setLoading(false);
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//                 setError(error.message);
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     if (loading) {
//         return <p>Loading...</p>;
//     }

//     if (error) {
//         return <p>Error: {error}</p>;
//     }

//     const pieChartData = [
//         { name: 'Pending', value: pendingProducts.length },
//         { name: 'Approved', value: approvedProducts.length },
//         { name: 'Rejected', value: rejectedProducts.length },
//     ];

//     const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

//     return (
//         <div>
//             <h1>Admin Dashboard</h1>

//             <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
//                 <BarChart width={600} height={300} data={approvedProducts}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="price" fill="#8884d8" />
//                 </BarChart>

//                 <PieChart width={400} height={400}>
//                     <Pie
//                         data={pieChartData}
//                         cx={200}
//                         cy={200}
//                         labelLine={false}
//                         label
//                         outerRadius={80}
//                         fill="#8884d8"
//                         dataKey="value"
//                     >
//                         {pieChartData.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                         ))}
//                     </Pie>
//                     <Tooltip />
//                 </PieChart>
//             </div>

//             <h2>Pending Products</h2>
//             <ul>
//                 {pendingProducts.map(product => (
//                     <li key={product._id}>{product.name} - ${product.price}</li>
//                 ))}
//             </ul>

//             <h2>Approved Products</h2>
//             <ul>
//                 {approvedProducts.map(product => (
//                     <li key={product._id}>{product.name} - ${product.price}</li>
//                 ))}
//             </ul>

//             <h2>Rejected Products</h2>
//             <ul>
//                 {rejectedProducts.map(product => (
//                     <li key={product._id}>{product.name} - ${product.price}</li>
//                 ))}
//             </ul>

//             <h2>Testimonials</h2>
//             <ul>
//                 {testimonials.map(testimonial => (
//                     <li key={testimonial._id}>{testimonial.name}: {testimonial.text}</li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default AdminDashboard;