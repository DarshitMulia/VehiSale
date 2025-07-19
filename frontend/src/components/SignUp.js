import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/signuplogin.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUp = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('user');
        if (auth) {
            navigate('/');
        }
    }, [navigate]);

    const validateForm = () => {
        let errors = {};
        let isValid = true;

        if (!name.trim()) {
            errors.name = 'Please enter your name.';
            isValid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            errors.email = 'Please enter your email.';
            isValid = false;
        } else if (!emailPattern.test(email)) {
            errors.email = 'Invalid email format';
            isValid = false;
        }

        if (!password.trim()) {
            errors.password = 'Please enter your password.';
            isValid = false;
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters long.';
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };

    const collectData = async () => {
        try {
            if (validateForm()) {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, isAdmin: false }),
                    headers: {
                        'Content-type': 'application/json',
                    },
                });
                if (response.ok) {
                    const result = await response.json();
                    localStorage.setItem('user', JSON.stringify(result.user));
                    localStorage.setItem('token', JSON.stringify(result.auth));
                    setShowPopup(true);

                    setTimeout(() => {
                        navigate('/');
                        setShowPopup(false);
                    }, 2000);
                } else {
                    console.error('Failed to register user:', response.statusText);
                    alert('Failed to register user. Please try again later.');
                }
            }
        } catch (error) {
            console.error('Error during user registration:', error);
            alert('Error during user registration. Please try again later.');
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            collectData();
        }
    };

    return (
        <div className='centered-element'>
            <div className='signuplogin-container'>
                <div className='signuplogin-content'>
                    <div className='welcome-text'>
                        <h3>Welcome to the <span className='highlight'>World of Cars!</span></h3>
                    </div>
                    <div className='signuplogin-form-container'>
                        <div className='signuplogin-image'>
                            <img src='./images/signuplogincar.webp' alt='img' />
                        </div>
                        <div className='signuplogin-form'>
                            <h1>Sign up</h1>
                            <div className='form-group'>
                                <input
                                    type="text"
                                    placeholder="Enter Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {errors.name && <p style={{ color: 'red', fontSize: '12px' }}>{errors.name}</p>}
                            </div>
                            <div className='form-group'>
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && <p style={{ color: 'red', fontSize: '12px' }}>{errors.email}</p>}
                            </div>
                            <div className='form-group'>
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
                                {errors.password && <p style={{ color: 'red', fontSize: '12px' }}>{errors.password}</p>}
                            </div>

                            <center>
                                <button className='signuplogin-button' onClick={collectData}>Sign up</button>
                            </center>

                            <div className='signuplogin-link'>
                                <p style={{ marginRight: "10px" }}>Already a User?</p>
                                <Link to="/login">Login</Link>
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
                            <p>SignUp successful!</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignUp;