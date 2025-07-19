import React, { useState, useEffect } from 'react';
import {
    FaCheckCircle as CheckCircleIcon,
    FaTimesCircle as CancelIcon,
    FaClock as PendingIcon,
    FaCalendarAlt as CalendarIcon,
    FaCar as BrandIcon,
    FaExclamationTriangle as AlertIcon
} from 'react-icons/fa';
import '../styles/userprofile.css';

const CarCard = ({ item, status }) => (
    <div className={`vehicle-card ${status}`}>
        <div className="card-media">
            <img
                src={`data:image/jpeg;base64,${item.image}`}
                alt={item.name}
                className="vehicle-image"
            />
            <div className="card-status">
                {status === 'approved' && <CheckCircleIcon />}
                {status === 'rejected' && <CancelIcon />}
                {status === 'pending' && <PendingIcon />}
                <span>{status.toUpperCase()}</span>
            </div>
        </div>

        <div className="card-content">
            <div className="vehicle-header">
                <h4 className="vehicle-title">{item.name}</h4>
                <span className="vehicle-price">₹{item.price}</span>
            </div>

            <div className="vehicle-meta">
                <div className="meta-item">
                    <CalendarIcon />
                    <span>{item.year}</span>
                </div>
                <div className="meta-item">
                    <BrandIcon />
                    <span>{item.company}</span>
                </div>
            </div>

            {status === 'rejected' && (
                <div className="rejection-notice">
                    <div className="notice-header">
                        <AlertIcon />
                        <h5>Rejection Reason</h5>
                    </div>
                    <p>{item.reason}</p>
                </div>
            )}
        </div>
    </div>
);

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [approvedCars, setApprovedCars] = useState([]);
    const [rejectedCars, setRejectedCars] = useState([]);
    const [pendingCars, setPendingCars] = useState([]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchUserCars(parsedUser._id);
            fetchUserRejectedCars(parsedUser._id);
            fetchUserPendingCars(parsedUser._id);
        } else {
            setError('User data not found');
        }
        setIsLoading(false);
    }, []);

    const fetchUserCars = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products/user/approved', {
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
            const response = await fetch('http://localhost:5000/api/products/user/rejected', {
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
            const response = await fetch('http://localhost:5000/api/products/user/pending', {
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

                        {(approvedCars.length || rejectedCars.length || pendingCars.length) > 0 ? (
                            <div className="car-dashboard">
                                <div className="status-container">
                                    {approvedCars.length > 0 && (
                                        <div className="card-container">
                                            {approvedCars.map((item) => (
                                                <CarCard key={item._id} item={item} status="approved" />
                                            ))}
                                        </div>
                                    )}

                                    {pendingCars.length > 0 && (
                                        <div className="card-container">
                                            {pendingCars.map((item) => (
                                                <CarCard key={item._id} item={item} status="pending" />
                                            ))}
                                        </div>
                                    )}

                                    {rejectedCars.length > 0 && (
                                        <div className="card-container">
                                            {rejectedCars.map((item) => (
                                                <CarCard key={item._id} item={item} status="rejected" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <h3 className="empty-title">No Vehicles Listed</h3>
                                <p className="empty-message">Get started by adding your first vehicle!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
