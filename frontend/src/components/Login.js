import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/signuplogin.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState({ email: '', password: '' });
    const [showPopup, setShowPopup] = useState(false);

    const refreshPageOnce = () => {
        const refreshed = localStorage.getItem('refreshed');
        if (!refreshed) {
            localStorage.setItem('refreshed', 'true');
            window.location.reload();
        }
    };

    useEffect(() => {
        refreshPageOnce();
        const auth = localStorage.getItem('user');
        if (auth) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        return () => {
            localStorage.removeItem('refreshed');
        };
    }, []);

    const handleLogin = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            setError(prevState => ({ ...prevState, email: 'Please enter your email.' }));
        } else if (!emailRegex.test(email)) {
            setError(prevState => ({ ...prevState, email: 'Please enter a valid email address.' }));
        } else {
            setError(prevState => ({ ...prevState, email: '' }));
        }

        if (!password.trim()) {
            setError(prevState => ({ ...prevState, password: 'Please enter your password.' }));
        } else {
            setError(prevState => ({ ...prevState, password: '' }));
        }

        if (email.trim() && password.trim() && !error.email && !error.password) {
            try {
                let result = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                    headers: {
                        'Content-type': 'application/json',
                    },
                });
                result = await result.json();

                if (result.auth) {
                    localStorage.setItem('user', JSON.stringify(result.user));
                    localStorage.setItem('token', JSON.stringify(result.auth));
                    setShowPopup(true);

                    setTimeout(() => {
                        if (result.user.isAdmin) {
                            navigate('/admindashboard');
                        } else {
                            navigate('/');
                        }
                        setShowPopup(false);
                    }, 2000);
                } else {
                    setError({ email: '', password: 'Invalid email or password. Please try again.' });
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('Error during login. Please try again later.');
            }
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="centered-element">
            <div className="signuplogin-container">
                <div className="signuplogin-content">
                    <div className="welcome-text">
                        <h3>
                            Welcome back to the <span className="highlight">World of Cars!</span>
                        </h3>
                    </div>
                    <div className="signuplogin-form-container">
                        <div className="signuplogin-image">
                            <img src="./images/signuplogincar.webp" alt="img" />
                        </div>
                        <div className="signuplogin-form">
                            <h1>Login</h1>
                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={handleKeyDown} />
                                {error.email && <p style={{ color: 'red', fontSize: '12px' }}>{error.email}</p>}
                            </div>
                            <div className="form-group">
                                <div className='password-container'>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <span
                                        className='password-toggle'
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                                    </span>
                                </div>
                                {error.password && <p style={{ color: 'red', fontSize: '12px' }}>{error.password}</p>}
                            </div>
                            <center>
                                <button className="signuplogin-button" onClick={handleLogin}>
                                    Login
                                </button>
                            </center>
                            <div className='signuplogin-link'>
                                <p style={{ marginRight: "10px" }}>New User?</p>
                                <Link to="/signup">SignUp</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <div className="popup-content">
                            <span className="tick-emoji">✅</span>
                            <p>Login successful!</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
