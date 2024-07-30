import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [company, setCompany] = useState('');
    const [image, setImage] = useState(null);
    const [year, setYear] = useState('');
    const [mileage, setMileage] = useState('');
    const [color, setColor] = useState('');
    const [transmission, setTransmission] = useState('');
    const [fuelType, setFuelType] = useState('');
    const [errors, setErrors] = useState({
        name: '',
        price: '',
        category: '',
        company: '',
        year: '',
        mileage: '',
        color: '',
        transmission: '',
        fuelType: '',
        image: '',
    });
    const [showPopup, setShowPopup] = useState(false);

    const navigate = useNavigate();

    const validateInputs = () => {
        const newErrors = {};

        if (!name) {
            newErrors.name = 'Name is required';
        }

        if (!price) {
            newErrors.price = 'Price is required';
        } else if (isNaN(price)) {
            newErrors.price = 'Price must be a number';
        } else if (price <= 0) {
            newErrors.price = 'Price must be greater than zero';
        }

        if (!category) {
            newErrors.category = 'Category is required';
        }

        if (!company) {
            newErrors.company = 'Company is required';
        }

        if (!year) {
            newErrors.year = 'Year is required';
        } else if (isNaN(year)) {
            newErrors.year = 'Year must be a number';
        } else if (year <= 0) {
            newErrors.year = 'Year must be greater than zero';
        }

        if (!mileage) {
            newErrors.mileage = 'Mileage is required';
        } else if (isNaN(mileage)) {
            newErrors.mileage = 'Mileage must be a number';
        } else if (mileage < 0) {
            newErrors.mileage = 'Mileage must be greater than or equal to zero';
        }

        if (!color) {
            newErrors.color = 'Color is required';
        }

        if (!fuelType) {
            newErrors.fuelType = 'Fuel Type is required';
        }

        if (!transmission) {
            newErrors.transmission = 'Transmission is required';
        }

        if (!image) {
            newErrors.image = 'Image is required';
        }

        setErrors(newErrors);

        return Object.values(newErrors).every(error => !error);
    };

    const addProduct = async () => {
        try {
            if (!validateInputs()) {
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('price', price);
            formData.append('category', category);
            formData.append('company', company);
            formData.append('image', image);
            formData.append('year', year);
            formData.append('mileage', mileage);
            formData.append('color', color);
            formData.append('transmission', transmission);
            formData.append('fuelType', fuelType);

            const response = await fetch('http://localhost:5000/add-product', {
                method: 'POST',
                headers: {
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                },
                body: formData,
            });

            if (response.ok) {
                setShowPopup(true);
                setTimeout(() => {
                    setShowPopup(false);
                    navigate('/');
                }, 3000);
            } else {
                console.error('Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };

    return (
        <div>
            {showPopup && (
                <div class="add-product-popup">
                    <div class="add-product-popup-content">
                        <div class="car-container">
                            <div class="car-animation">
                                🚗
                            </div>
                        </div>
                        <h2>Success!</h2>
                        <p>Car added successfully!</p>
                    </div>
                </div>
            )}
            <div className="center-container">
                <h1>Add Car</h1>
                <div className='border'></div>
                <div className="add-product-container">
                    <div className='row'>
                        <div className="col">
                            <p><b>Model</b></p>
                            <input
                                type="text"
                                placeholder="Enter Model"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="add-product-input" />
                            {errors.name && <p className="error-message" style={{ fontSize: "12px" }}>{errors.name}</p>}
                        </div>

                        <div className="col">
                            <p><b>Price</b></p>
                            <input
                                type="text"
                                placeholder="Enter Price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="add-product-input" />
                            {errors.price && <p className="error-message" style={{ fontSize: "12px" }}>{errors.price}</p>}
                        </div>

                        <div className="col">
                            <p><b>Category</b></p>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="add-product-input"
                            >
                                <option value="">Select Category</option>
                                <option value="Hatchback">Hatchback</option>
                                <option value="Mini Hatchback">Mini Hatchback</option>
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Crossover">Crossover</option>
                                <option value="Coupe">Coupe</option>
                                <option value="Convertible">Convertible</option>
                                <option value="Wagon">Wagon</option>
                            </select>
                            {errors.category && <p className="error-message" style={{ fontSize: "12px" }}>{errors.category}</p>}
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}></div>

                    <div className='row'>
                        <div className="col">
                            <p><b>Company</b></p>
                            <select
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="add-product-input"
                            >
                                <option value="">Select Company</option>
                                <option value="Acura">Acura</option>
                                <option value="Alfa Romeo">Alfa Romeo</option>
                                <option value="Aston Martin">Aston Martin</option>
                                <option value="Audi">Audi</option>
                                <option value="Bentley">Bentley</option>
                                <option value="BMW">BMW</option>
                                <option value="Bugatti">Bugatti</option>
                                <option value="Buick">Buick</option>
                                <option value="Cadillac">Cadillac</option>
                                <option value="Chevrolet">Chevrolet</option>
                                <option value="Chrysler">Chrysler</option>
                                <option value="Citroën">Citroën</option>
                                <option value="Dodge">Dodge</option>
                                <option value="Ferrari">Ferrari</option>
                                <option value="Fiat">Fiat</option>
                                <option value="Ford">Ford</option>
                                <option value="Genesis">Genesis</option>
                                <option value="GMC">GMC</option>
                                <option value="Honda">Honda</option>
                                <option value="Hyundai">Hyundai</option>
                                <option value="Infiniti">Infiniti</option>
                                <option value="Jaguar">Jaguar</option>
                                <option value="Jeep">Jeep</option>
                                <option value="Kia">Kia</option>
                                <option value="Lamborghini">Lamborghini</option>
                                <option value="Land Rover">Land Rover</option>
                                <option value="Lexus">Lexus</option>
                                <option value="Lincoln">Lincoln</option>
                                <option value="Lotus">Lotus</option>
                                <option value="Maserati">Maserati</option>
                                <option value="Mazda">Mazda</option>
                                <option value="McLaren">McLaren</option>
                                <option value="Mercedes-Benz">Mercedes-Benz</option>
                                <option value="MINI">MINI</option>
                                <option value="Mitsubishi">Mitsubishi</option>
                                <option value="Nissan">Nissan</option>
                                <option value="Porsche">Porsche</option>
                                <option value="Ram">Ram</option>
                                <option value="Rolls-Royce">Rolls-Royce</option>
                                <option value="Saab">Saab</option>
                                <option value="Skoda">Skoda</option>
                                <option value="Subaru">Subaru</option>
                                <option value="Suzuki">Suzuki</option>
                                <option value="Tesla">Tesla</option>
                                <option value="Toyota">Toyota</option>
                                <option value="Volkswagen">Volkswagen</option>
                                <option value="Volvo">Volvo</option>
                            </select>
                            {errors.company && <p className="error-message" style={{ fontSize: "12px" }}>{errors.company}</p>}
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}></div>

                    <div className='row'>
                        <div className="col">
                            <p><b>Year</b></p>
                            <input
                                type="text"
                                placeholder="Enter Year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="add-product-input" />
                            {errors.year && <p className="error-message" style={{ fontSize: "12px" }}>{errors.year}</p>}
                        </div>
                        <div className="col">
                            <p><b>Mileage</b></p>
                            <input
                                type="text"
                                placeholder="Enter Mileage"
                                value={mileage}
                                onChange={(e) => setMileage(e.target.value)}
                                className="add-product-input" />
                            {errors.mileage && <p className="error-message" style={{ fontSize: "12px" }}>{errors.mileage}</p>}
                        </div>
                        <div className="col">
                            <p><b>Color</b></p>
                            <select
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="add-product-input"
                            >
                                <option value="">Select Color</option>
                                <option value="Black">Black</option>
                                <option value="White">White</option>
                                <option value="Gray">Gray</option>
                                <option value="Silver">Silver</option>
                                <option value="Blue">Blue</option>
                                <option value="Red">Red</option>
                                <option value="Brown">Brown</option>
                                <option value="Green">Green</option>
                                <option value="Yellow">Yellow</option>
                                <option value="Orange">Orange</option>
                                <option value="Gold">Gold</option>
                                <option value="Purple">Purple</option>
                                <option value="Pink">Pink</option>
                            </select>
                            {errors.color && <p className="error-message" style={{ fontSize: "12px" }}>{errors.color}</p>}
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}></div>

                    <div className='row'>
                    <div className="col">
                            <p><b>Fuel Type</b></p>
                            <select
                                value={fuelType}
                                onChange={(e) => setFuelType(e.target.value)}
                                className="add-product-input"
                            >
                                <option value="">Select Fuel Type</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="CNG">CNG</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                            {errors.fuelType && <p className="error-message" style={{ fontSize: "12px" }}>{errors.fuelType}</p>}
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}></div>

                    <div className='row'>
                        <div className="col">
                            <p><b>Transmission</b></p>
                            <div className="radio-buttons">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="transmission"
                                        value="Automatic"
                                        checked={transmission === "Automatic"}
                                        onChange={(e) => setTransmission(e.target.value)}
                                        className="add-product-input"
                                    />
                                    Automatic
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="transmission"
                                        value="Manual"
                                        checked={transmission === "Manual"}
                                        onChange={(e) => setTransmission(e.target.value)}
                                        className="add-product-input"
                                    />
                                    Manual
                                </label>
                            </div>
                            {errors.transmission && <p className="error-message" style={{ fontSize: "12px" }}>{errors.transmission}</p>}
                        </div>
                        <div className="col">
                            <p><b>Upload Car Image</b></p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="add-product-input" />
                            {errors.image && <p className="error-message" style={{ fontSize: "12px" }}>{errors.image}</p>}
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}></div>

                    <center><button onClick={addProduct} className="add-product-button" style={{ width: "100%" }}>Add Car</button></center>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
