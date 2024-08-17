import React from "react";
import { Link } from 'react-router-dom';
import '../styles/header.css';

const Header = () => {
    const auth = JSON.parse(localStorage.getItem("user"));

    return (
        <div>
            {auth ? (
                <nav className="navbar navbar-expand-lg navbar-light">
                    <div className="container-fluid header-container">
                        <Link to="/" className="navbar-brand">
                            <div className="container">
                                <img alt='logo' className="logo header-logo" src="./images/logo.png" style={{ width: "125px" }} />
                            </div>
                        </Link>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="nav-links navbar-nav ms-auto">
                                {auth.isAdmin && (
                                    <li className="nav-item" style={{ marginTop: "5px" }}>
                                        <Link to="/admindashboard" className="nav-link">Dashboard</Link>
                                    </li>
                                )}
                                <li className="nav-item" style={{ marginTop: "5px" }}>
                                    <Link to="/" className="nav-link">Buy Car</Link>
                                </li>
                                <li className="nav-item" style={{ marginTop: "5px" }}>
                                    <Link to="/add" className="nav-link">Add Car</Link>
                                </li>
                                <li className="nav-item" style={{ marginTop: "5px" }}>
                                    <Link to="/testimonials" className="nav-link">Testimonials</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/profile" className="nav-link">
                                        <div className="header-profile">
                                            <img src="https://img.freepik.com/premium-vector/man-profile-cartoon_18591-58482.jpg" alt="Profile" />
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            ) : (
                <div></div>
            )}
        </div>
    );
};

export default Header;
