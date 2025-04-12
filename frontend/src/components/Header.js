import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "../styles/header.css";

Modal.setAppElement("#root");

const Header = () => {
    const auth = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        console.log("Toggle dropdown clicked!");
        setDropdownOpen((prev) => !prev);
    };

    const handleMyProfile = () => {
        navigate("/profile");
        setDropdownOpen(false);
    };

    const handleLogout = () => {
        setModalIsOpen(true);
        setDropdownOpen(false);
    };

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [dropdownOpen]);

    return (
        <div>
            {auth ? (
                <nav className="navbar navbar-expand-lg navbar-light">
                    <div className="container-fluid header-container">
                        <Link to="/" className="navbar-brand">
                            <div className="container">
                                <img
                                    alt="logo"
                                    className="logo header-logo"
                                    src="./images/logo.png"
                                />
                            </div>
                        </Link>
                        <button
                            className="navbar-toggler"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent"
                            aria-controls="navbarSupportedContent"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="nav-links navbar-nav ms-auto">
                                {auth.isAdmin ? (
                                    <>
                                        <li className="nav-item mt-1">
                                            <Link to="/admindashboard" className="nav-link">
                                                Dashboard
                                            </Link>
                                        </li>
                                        <li className="nav-item mt-1">
                                            <Link to="/pendingproducts" className="nav-link">
                                                Pending Car Requests
                                            </Link>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="nav-item mt-1">
                                            <Link to="/" className="nav-link">
                                                Buy Car
                                            </Link>
                                        </li>
                                        <li className="nav-item mt-1">
                                            <Link to="/add" className="nav-link">
                                                Add Car
                                            </Link>
                                        </li>
                                        <li className="nav-item mt-1">
                                            <Link to="/testimonials" className="nav-link">
                                                Testimonials
                                            </Link>
                                        </li>
                                    </>
                                )}
                                <li className="nav-item profile-dropdown mt-1" ref={dropdownRef}>
                                    <div
                                        className="dropdown-toggle"
                                        onClick={toggleDropdown}
                                    >
                                        <img
                                            src="https://img.freepik.com/premium-vector/man-profile-cartoon_18591-58482.jpg"
                                            alt="Profile"
                                            className="header-profile-img"
                                        />
                                    </div>
                                    {dropdownOpen && (
                                        <div className="dropdown-menu">
                                            <button
                                                className="dropdown-item"
                                                onClick={handleMyProfile}
                                            >
                                                My Profile
                                            </button>
                                            <button
                                                className="dropdown-item"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            ) : (
                <div></div>
            )}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                className={{
                    base: "logout-modal",
                    afterOpen: "logout-modal-open",
                    beforeClose: "logout-modal-close"
                }}
                closeTimeoutMS={300}
            >
                <div className="modal-content">
                    <h2 className="modal-header">Confirm Logout</h2>
                    <p>Are you sure you want to log out?</p>
                    <div className="modal-buttons">
                        <button
                            className="modal-logout-cancel-button"
                            onClick={() => setModalIsOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="modal-logout-submit-button"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Header;
