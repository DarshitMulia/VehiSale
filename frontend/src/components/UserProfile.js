import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import Modal from 'react-modal';


const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [approvedCars, setApprovedCars] = useState([]);
    const [rejectedCars, setRejectedCars] = useState([]);
    const [pendingCars, setPendingCars] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    }

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
            fetchUserCars(JSON.parse(userData)._id);
            fetchUserRejectedCars(JSON.parse(userData)._id);
            fetchUserPendingCars(JSON.parse(userData)._id);
        } else {
            setError('User data not found');
        }
        setIsLoading(false);
    }, []);

    const fetchUserCars = async () => {
        try {
            const response = await fetch('http://localhost:5000/user-cars', {
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setApprovedCars(data);
            } else {
                setError('Failed to fetch user cars');
            }
        } catch (error) {
            setError('Error fetching user cars');
        }
    };

    const fetchUserRejectedCars = async () => {
        try {
            const response = await fetch('http://localhost:5000/user-rejected-cars', {
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRejectedCars(data);
            } else {
                setError('Failed to fetch user cars');
            }
        } catch (error) {
            setError('Error fetching user cars');
        }
    };

    const fetchUserPendingCars = async () => {
        try {
            const response = await fetch('http://localhost:5000/user-pending-cars', {
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPendingCars(data);
            } else {
                setError('Failed to fetch user cars');
            }
        } catch (error) {
            setError('Error fetching user cars');
        }
    };

    return (
        <div className='main-container-user-profile'>
            <div className="user-profile-container">
                {isLoading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}
                {user && (
                    <>
                        <div className="profile-header">
                            <h1 style={{ color: "#434343" }}>Profile</h1>
                            <div className="border"></div>
                        </div>
                        <div className="profile-details">
                            <div className="profile-picture">
                                <img src="https://img.freepik.com/premium-vector/man-profile-cartoon_18591-58482.jpg" alt="Profile" />
                            </div>
                            <div className="user-info">
                                <h5>{user.name}</h5>
                                <p>Email: {user.email}</p>
                            </div>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <h3>Car Listings</h3>
                        </div>
                        {approvedCars.length || rejectedCars.length || pendingCars.length > 0 ? (
                            <div className="car-list">
                                {approvedCars.map((item) => (
                                    <div className="listing" key={item._id}>
                                        <img className="car-image" src={`data:image/jpeg;base64,${item.image}`} alt="Car" />
                                        <div className="listing-details">
                                            <h5>{item.name}</h5>
                                            <tbody>
                                                <tr>
                                                    <td><p>Price</p></td>
                                                    <td>:</td>
                                                    <td>₹ {item.price}</td>
                                                </tr>
                                                <tr>
                                                    <td><p>year</p></td>
                                                    <td>:</td>
                                                    <td>{item.year}</td>
                                                </tr>
                                                <tr>
                                                    <td><p>Company</p></td>
                                                    <td>:</td>
                                                    <td>{item.company}</td>
                                                </tr>
                                                <tr>
                                                    <td><p>Status</p></td>
                                                    <td>:</td>
                                                    <td><span style={{ color: "#66FF00" }}><b>Approved</b></span></td>
                                                </tr>
                                            </tbody>
                                        </div>
                                    </div>
                                ))}
                                {rejectedCars.map((item) => (
                                    <div className="listing" key={item._id}>
                                        <img className="car-image" style={{ height: "250px" }} src={`data:image/jpeg;base64,${item.image}`} alt="Car" />
                                        <div className="listing-details">
                                            <h5>{item.name}</h5>
                                            <tbody>
                                                <tr>
                                                    <td><p>Price</p></td>
                                                    <td>:</td>
                                                    <td>₹ {item.price}</td>
                                                </tr>
                                                <tr>
                                                    <td><p>year</p></td>
                                                    <td>:</td>
                                                    <td>{item.year}</td>
                                                </tr>
                                                <tr>
                                                    <td><p>Company</p></td>
                                                    <td>:</td>
                                                    <td>{item.company}</td>
                                                </tr>
                                                <tr>
                                                    <td><p>Status</p></td>
                                                    <td>:</td>
                                                    <td><span style={{ color: "red" }}><b>Rejected</b></span></td>
                                                </tr>
                                                <tr>
                                                    <td><p>Reason</p></td>
                                                    <td>:</td>
                                                    <td>{item.reason}</td>
                                                </tr>
                                            </tbody>
                                        </div>
                                    </div>
                                ))}
                                {pendingCars.map((item) => (
                                    <div className="listing" key={item._id}>
                                        <img className="car-image" src={`data:image/jpeg;base64,${item.image}`} alt="Car" />
                                        <div className="listing-details">
                                            <h5>{item.name}</h5>
                                            <tbody>
                                                <tr>
                                                    <td><p>Price</p></td>
                                                    <td>:</td>
                                                    <td>₹ {item.price}</td>
                                                </tr>
                                                <tr>
                                                    <td><p>Year</p></td>
                                                    <td>:</td>
                                                    <td>{item.year}</td>
                                                </tr>
                                                <tr>
                                                    <td><p>Company</p></td>
                                                    <td>:</td>
                                                    <td>{item.company}</td>
                                                </tr>
                                                <tr>
                                                    <td><p>Status</p></td>
                                                    <td>:</td>
                                                    <td><span style={{ color: "blue" }}><b>Pending</b></span></td>
                                                </tr>
                                            </tbody>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No cars added yet.</p>
                        )}
                        <div className="profile-actions">
                            <button className="edit-button" onClick={() => setModalIsOpen(true)}>Logout</button>
                        </div>

                        <Modal
                            isOpen={modalIsOpen}
                            onRequestClose={() => setModalIsOpen(false)}
                            className={{
                                base: 'logout-modal',
                                afterOpen: 'logout-modal-open',
                                beforeClose: 'logout-modal-close'
                            }}
                            closeTimeoutMS={300}
                        >
                            <div className="modal-content">
                                <h2 className="modal-header">Confirm Logout</h2>
                                <p>Are you sure you want to log out?</p>
                                <div className="modal-buttons">
                                    <button className="modal-logout-cancel-button" onClick={() => setModalIsOpen(false)}>Cancel</button>
                                    <button className="modal-logout-submit-button" onClick={logout}>Logout</button>
                                </div>
                            </div>
                        </Modal>
                    </>
                )}
            </div>
        </div>


    );
};

export default UserProfile;
