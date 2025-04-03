import React, { useEffect, useState } from 'react';
import { fetchWishlistedCars, toggleWishlist, getUserIdFromToken, fetchCartItems, addToCart, removeFromCart } from '../api';
import { FaHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import '../styles/Catalog.css'; // Use the same CSS as Catalog

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

const Wishlist = () => {
  const [wishlistedCars, setWishlistedCars] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cars = await fetchWishlistedCars();
        setWishlistedCars(cars);

        if (userId) {
          const cartData = await fetchCartItems();
          setCartItems(cartData);
        }
      } catch (error) {
        console.error('Error fetching wishlisted cars or cart items:', error);
      }
    };
    fetchData();
  }, []);

  const handleLearnMore = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  const handleWishlistClick = async (carId) => {
    try {
      const updatedCar = await toggleWishlist(carId);
      setWishlistedCars(prevCars => 
        prevCars.filter(car => car._id !== updatedCar.car._id)
      );
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleCartClick = async (car) => {
    if (!userId) {
      alert("Please login to manage your cart");
      return;
    }

    try {
      const isInCart = cartItems.some(item => item._id === car._id);

      if (isInCart) {
        await removeFromCart(car._id);
        setCartItems(prev => prev.filter(item => item._id !== car._id));
      } else {
        await addToCart(car._id);
        setCartItems(prev => [...prev, car]);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  return (
    <div className="catalog">
      {/* Wishlist Header */}
      <div className="catalog-header">
        <h2>Your Wishlist</h2>
      </div>

      {/* Cars Grid - same as Catalog */}
      <div className="car-grid">
        {wishlistedCars.length === 0 ? (
          <div className="no-cars-message">
            No cars in your wishlist.
          </div>
        ) : (
          wishlistedCars.map((car) => {
            const isInCart = cartItems.some(item => item._id === car._id);

            return (
              <div key={car._id} className="car-tile">
                {/* Wishlist Icon */}
                <div className="wishlist-icon" onClick={() => handleWishlistClick(car._id)}>
                  <FaHeart style={{ color: "red" }} />
                </div>

                {/* Car Image */}
                <div className="car-image-container">
                  <img 
                    src={`${API_BASE_URL.replace(/\/$/, '')}/${car.image.replace(/^\//, '')}`} 
                    alt={`${car.brand} ${car.model}`} 
                    className="car-image" 
                  />
                </div>

                {/* Car Details */}
                <div className="car-details">
                  <h3>{car.brand} {car.model}, {car.year}</h3>
                  <p className="car-price">${car.price}/hr</p>
                </div>

                {/* Buttons */}
                <div className="car-buttons">
                  <button
                    className={`cart-button ${isInCart ? "in-cart" : ""}`}
                    onClick={() => handleCartClick(car)}
                  >
                    {isInCart ? (
                      <div className="striked-cart">
                        <FaShoppingCart />
                        <div className="strike-line"></div>
                      </div>
                    ) : (
                      <FaShoppingCart />
                    )}
                  </button>
                  <button
                    className="learn-more-button"
                    onClick={() => handleLearnMore(car)}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Detailed Car Information - same as Catalog */}
      {isModalOpen && selectedCar && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-button" onClick={handleCloseModal}>
              ×
            </button>
            <div className="modal-car-image-container">
              <img 
                src={`${API_BASE_URL.replace(/\/$/, '')}/${selectedCar.image.replace(/^\//, '')}`} 
                alt={`${selectedCar.brand} ${selectedCar.model}`} 
                className="modal-car-image" 
              />
            </div>
            <h2>{selectedCar.brand} {selectedCar.model}</h2>
            <p>Type: {selectedCar.type}</p>
            <p>Mileage: {selectedCar.mileage}</p>
            <p>Price: ${selectedCar.price}/hr</p>
            <p>Availability: {selectedCar.availability}</p>
            <div className="modal-buttons">
              <button
                className={`cart-button2 ${cartItems.some(item => item._id === selectedCar._id) ? "in-cart" : ""}`}
                onClick={() => handleCartClick(selectedCar)}
              >
                <FaShoppingCart />
              </button>
              <button className="book-now-button">Book Now</button>
            </div>
            <div className="owner-details">
              <h3>Owner Details</h3>
              <p>Name: {selectedCar.owner?.firstName || "N/A"}</p>
              <p>Phone: {selectedCar.owner?.phoneNumber || "N/A"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
