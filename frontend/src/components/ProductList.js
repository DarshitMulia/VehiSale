import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        priceRange: '',
        colors: '',
        company: '',
        transmission: '',
        fuelType: ''
    });

    const refreshPageOnce = () => {
        const refreshed = localStorage.getItem('refreshed');
        if (!refreshed) {
            localStorage.setItem('refreshed', 'true');
            window.location.reload();
        }
    };

    useEffect(() => {
        refreshPageOnce();
    }, []);

    useEffect(() => {
        getProducts();
        // eslint-disable-next-line
    }, [filters]);

    const getProducts = async () => {
        try {
            let queryParams = '';
            for (const key in filters) {
                if (filters[key]) {
                    if (key === 'priceRange') {
                        const [minPrice, maxPrice] = filters[key].split('-').map(price => price.replace(/,/g, '').trim());
                        queryParams += `&priceRange=${minPrice}-${maxPrice}`;
                    } else {
                        queryParams += `&${key}=${filters[key]}`;
                    }
                }
            }
            console.log('Query Params:', queryParams);
            let result = await fetch(`http://localhost:5000/products?${queryParams}`, {
                headers: {
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            if (!result.ok) {
                throw new Error('Failed to fetch products');
            }
            result = await result.json();
            setProducts(result);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [field]: value
        }));
    };

    const searchHandle = async (event) => {
        try {
            let key = event.target.value.trim();
            if (key) {
                let result = await fetch(`http://localhost:5000/search/${key}`, {
                    headers: {
                        authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                    }
                });
                if (!result.ok) {
                    throw new Error('Failed to fetch search results');
                }
                result = await result.json();
                setProducts(result);
            } else {
                getProducts();
            }
        } catch (error) {
            console.error('Error searching for products:', error);
        }
    };

    return (
        <div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
            <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
                </div>
                <div className="carousel-inner img-blur">
                    <div className="carousel-item active">
                        <img src="https://www.strongrentacar.com/images/2023/04/09/Rent-A-Car-for-Family-Road-Trip.jpg" className="d-block w-100" alt="..." />
                        <div className="carousel-caption d-none d-md-block">
                            <h6 style={{ fontWeight: "bold" }} className="carousel-font">DON'T DREAM IT , DRIVE IT</h6>
                            <p className="carousel-font">Set out on the path to joy and become a valued member of VehiSale.</p>
                        </div>
                    </div>
                    <div className="carousel-item img-blur">
                        <img src="https://b1926513.smushcdn.com/1926513/wp-content/uploads/2022/03/Insurance-for-driving-test-opt-2500x1667.jpg?lossy=1&strip=1&webp=0" className="d-block w-100" alt="..." />
                        <div className="carousel-caption d-none d-md-block carousel-font">
                            <h6 style={{ fontWeight: "bold" }} className="carousel-font">WHERE ROADS LEAD, STORIES FOLLOW</h6>
                            <p className="carousel-font">Kickstart your quest for satisfaction and become part of the VehiSale family.</p>
                        </div>
                    </div>
                    <div className="carousel-item img-blur">
                        <img src="https://images.ctfassets.net/2sam6k0rncvg/5jB1yO0HQgS6z6153Kzdvw/76acb25f5bef27862270a724bdd32ecf/best-family-cars-in-india.png" className="d-block w-100" alt="..." />
                        <div className="carousel-caption d-none d-md-block carousel-font">
                            <h6 style={{ fontWeight: "bold" }} className="carousel-font">BEYOND BOUNDARIES, BEHIND WHEELS</h6>
                            <p className="carousel-font">Begin your adventure towards fulfillment with VehiSale by your side.</p>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
            <div className='main-conatiner'>
                <div className="product-list-container">
                    <center><h1 style={{ color: "#434343" }}>Cars</h1></center>
                    <div className="border"></div>
                    <div className="search-container">
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search Car based on either Model or Company"
                            onChange={searchHandle}
                        />
                        <button className="search-button" type="submit"><i className="fa fa-search"></i></button>
                    </div>
                    <div className="filter-section">
                        <div className="filters-container">
                            <div className="filter">
                                <label htmlFor="category">Category:</label>
                                <select id="category" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                                    <option value="">All</option>
                                    <option value="Hatchback">Hatchback</option>
                                    <option value="Mini Hatchback">Mini Hatchback</option>
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Crossover">Crossover</option>
                                    <option value="Coupe">Coupe</option>
                                    <option value="Convertible">Convertible</option>
                                    <option value="Wagon">Wagon</option>
                                </select>
                            </div>

                            <div className="filter">
                                <label htmlFor="priceRange">Price Range:</label>
                                <select id="priceRange" value={filters.priceRange} onChange={(e) => handleFilterChange('priceRange', e.target.value)}>
                                    <option value="">All</option>
                                    <option value="0-100,000">0 - 100,000</option>
                                    <option value="100,000-300,000">100,000 - 300,000</option>
                                    <option value="300,000-500,000">300,000 - 500,000</option>
                                    <option value="500,000-700,000">500,000 - 700,000</option>
                                    <option value="700,000-10,00,000">700,000 - 10,00,000</option>
                                    <option value="10,00,000-15,00,000">10,00,000 - 15,00,000</option>
                                </select>
                            </div>

                            <div className="filter">
                                <label htmlFor="colors">Colors:</label>
                                <select id="colors" value={filters.colors} onChange={(e) => handleFilterChange('colors', e.target.value)}>
                                    <option value="">All</option>
                                    <option value="Black">Black</option>
                                    <option value="White">White</option>
                                    <option value="Red">Red</option>
                                    <option value="Blue">Blue</option>
                                    <option value="Silver">Silver</option>
                                    <option value="Grey">Grey</option>
                                </select>
                            </div>

                            <div className="filter">
                                <label htmlFor="company">Company:</label>
                                <select id="company" value={filters.company} onChange={(e) => handleFilterChange('company', e.target.value)}>
                                    <option value="">All</option>
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
                            </div>

                            <div className="filter">
                                <label htmlFor="transmission">Transmission:</label>
                                <select id="transmission" value={filters.transmission} onChange={(e) => handleFilterChange('transmission', e.target.value)}>
                                    <option value="">All</option>
                                    <option value="Automatic">Automatic</option>
                                    <option value="Manual">Manual</option>
                                </select>
                            </div>

                            <div className="filter">
                                <label htmlFor="fuelType">Fuel Type:</label>
                                <select id="fuelType" value={filters.fuelType} onChange={(e) => handleFilterChange('fuelType', e.target.value)}>
                                    <option value="">All</option>
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Electric">Electric</option>
                                    <option value="CNG">CNG</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="product-cards">
                        {products.length > 0 ? (
                            products.map((item) => (
                                <div key={item._id} className="product-card">
                                    <div className="product-image" >
                                        <img src={`data:image/jpeg;base64,${item.image}`} alt={item.name} />
                                    </div>
                                    <div className="product-details-first-line">
                                        <h5>{item.name}</h5>
                                        <p style={{fontWeight:"bold"}}>₹ {item.price}</p>
                                    </div>
                                    <div className="container">
                                        <Link to={`/productdetails/${item._id}`} className="view-details-link">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-result">No Result Found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;


// eslint-disable-next-line
{/* const deleteProduct = async (id) => {
    let result = await fetch(`http://localhost:5000/product/${id}`, {
        method: 'DELETE',
        headers:{
            authorization:`bearer ${JSON.parse(localStorage.getItem('token'))}`
        }
    });
    result = await result.json();
    if (result) {
        getProducts();
    }
}; */}


