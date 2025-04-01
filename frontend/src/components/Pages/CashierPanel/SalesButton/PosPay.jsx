import React, { useState, useEffect, useContext } from "react";
import Popup from "reactjs-popup";
import { motion } from "framer-motion";
import "reactjs-popup/dist/index.css";
import { CartContext } from "../../../../contexts/CartContext";

const PosPay = () => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useContext(CartContext);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [cashPayment, setCashPayment] = useState("");
  const [cardPayment, setCardPayment] = useState("");
  const [giftVoucher, setGiftVoucher] = useState("");

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
          console.log("Fetched Products:", data.products);
        } else {
          console.error("Failed to fetch products:", data.message);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // Function to calculate the total price of the cart
  const calculateTotal = () => {
    return cart.reduce((sum, product) => sum + product.price * product.quantity, 0).toFixed(2);
  };

  // Handle product selection
  const handleProductSelect = (event) => {
    const selectedValue = event.target.value;
    setSelectedProduct(selectedValue);

    const selectedProduct = products.find((product) => product.id === parseInt(selectedValue));

    if (selectedProduct) {
      const isProductInCart = cart.some((product) => product.id === selectedProduct.id);

      if (!isProductInCart) {
        const newProduct = {
          id: selectedProduct.id,
          name: selectedProduct.product_name,
          price: selectedProduct.price,
          quantity: 1,
          discount: 0,
        };

        console.log("New Product Added to Cart:", newProduct);
        addToCart(newProduct);
      } else {
        alert("Product is already in the cart.");
      }
    }
  };

  // Handle payment submission
  const handlePayment = async () => {
    const paymentMethod = "Cash";
    const totalAmount = calculateTotal();

    try {
      const response = await fetch("http://localhost:5000/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod,
          totalAmount,
          cartItems: cart,
          customer: "Walk-In-Customer", // Default value
          phone: customerPhone, // From form input
          receiptNumber: 2865, // Default value
          cash: cashPayment, // From form input
          card: cardPayment, // From form input
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Payment processed successfully!");
        setPopupOpen(false);
      } else {
        alert("Failed to process payment.");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="main-content p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-3 gap-4">
        {/* Left Side (Product Selection) */}
        <div>
          <div className="barcode-select-container">
            <input
              type="text"
              placeholder="Alt + A (Barcode)"
              className="p-3 border border-gray-300 rounded-lg w-64"
            />
            <select
              className="p-3 border border-gray-300 rounded-lg w-full sm:w-[250px]"
              onChange={handleProductSelect}
              value={selectedProduct}
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  00{product.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side (POS Table) */}
        <div className="col-span-2 bg-black p-6 rounded-lg shadow-lg">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-500">
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Price (LKR)</th>
                <th className="px-4 py-2 text-center">Quantity</th>
                <th className="px-4 py-2 text-left">Total (LKR)</th>
                <th className="px-4 py-2 text-left">Remove</th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">No items in the cart</td>
                </tr>
              ) : (
                cart.map((product, index) => (
                  <tr key={product.id} className="border-b border-gray-500">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                        className="w-20 p-2 text-center border rounded-md bg-white text-black"
                      />
                    </td>
                    <td className="px-4 py-3">{(product.price * product.quantity).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeFromCart(product.id)}
                      >
                        (X)
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right Section (Gift Card and Payment) */}
        <div className="right-section">
          <div className="gift-card-section p-6 bg-black text-white rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-lg font-bold border-b border-gray-600 pb-2">AMAYA COLLECTION</h2>

            <div className="py-3">
              <p className="flex justify-between">
                <span>Gross:</span>
                <span className="font-bold">{calculateTotal()}</span>
              </p>
              <p className="flex justify-between">
                <span>Discount:</span>
                <span className="font-bold">(0.00)</span>
              </p>
            </div>

            <div><span>_______________________________________</span></div>

            <div className="border-t border-gray-600 py-3">
              <p className="flex justify-between font-semibold">
                <span>Net:</span>
                <span className="text-lg text-yellow-400 font-bold">LKR {calculateTotal()}</span>
              </p>
              <p className="flex justify-between">
                <span>No of Items:</span>
                <span>{cart.length}</span>
              </p>
            </div>

            <div><span>_______________________________________</span></div>

            <h3>Pay Gift Voucher</h3>
            <input type="text" placeholder="Voucher ID" className="w-full p-3 border border-gray-400 rounded-md mt-2" />

            <div><span>___________________________________________</span></div>

            {/* Pay Button */}
            <button
              className="w-full px-4 py-3 font-semibold rounded-md transition duration-300 
             border border-white text-white bg-transparent hover:bg-white hover:text-black"
              onClick={() => setPopupOpen(true)}
            >
              PAY (P)
            </button>

            <div><span>___________________________________________</span></div>

            {/* Hold Order Button */}
            <button
              className="w-full px-4 py-3 font-semibold rounded-md transition duration-300 
             border border-white text-white bg-blue-500 hover:bg-blue-600 mt-2"
            >
              HOLD THE ORDER (H)
            </button>

            <div><span>___________________________________________</span></div>

            <h3>Activate Gift Card</h3>
            <input type="text" placeholder="Voucher ID" className="w-full p-3 border border-gray-400 rounded-md mt-2" />
          </div>
        </div>
      </div>

      {/* Popup for Payment */}
      <Popup
        open={isPopupOpen}
        closeOnDocumentClick
        onClose={() => setPopupOpen(false)}
        modal
        lockScroll
        contentStyle={{
          maxWidth: "500px",
          width: "90%",
          padding: "25px",
          borderRadius: "12px",
          background: "white",
          boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
        overlayStyle={{
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {(close) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            <h3 className="text-xl font-semibold mb-4">PAY</h3>

            <div className="flex flex-col space-y-4">
              <label htmlFor="username">Customer Phone : </label>
              <input
                type="text"
                placeholder="Enter PhoneNo"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              /> <br></br>
              <br></br>
              <label htmlFor="username">Cash Payment (C) : </label>
              <input
                type="number"
                placeholder="Enter Cash"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={cashPayment}
                onChange={(e) => setCashPayment(e.target.value)}
              /><br></br>
              <br></br>
              <label htmlFor="username">Card Payment : </label>
              <input
                type="number"
                placeholder="Enter CardNo"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={cardPayment}
                onChange={(e) => setCardPayment(e.target.value)}
              /><br></br>
              <br></br>
              <label htmlFor="username">Total Amount : </label>
              <input
                type="number"
                placeholder=""
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={calculateTotal()}
                readOnly
              /><br></br>
              <br></br>
              <label htmlFor="username">Gift Voucher : </label>
              <input
                type="number"
                placeholder="VoucherID"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={giftVoucher}
                onChange={(e) => setGiftVoucher(e.target.value)}
              /><br></br>
            </div>

            <p className="text-lg font-bold text-red-600 bg-red-100 border-red-500 p-3 rounded-md mt-4">
              Balance: LKR -200
            </p>

            <div className="flex justify-end gap-4 mt-4">
              <button className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500" onClick={() => setPopupOpen(false)}>
                Close
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={handlePayment}>
                PAY
              </button>
            </div>
          </motion.div>
        )}
      </Popup>
    </div>
  );
};

export default PosPay;