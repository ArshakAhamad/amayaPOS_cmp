import React, { useState } from "react";
import Popup from "reactjs-popup";
import { motion } from "framer-motion";
import "reactjs-popup/dist/index.css";

const PosPay = () => {
  const [cart, setCart] = useState([
    { id: "0003", name: "A (Barcode)", price: 120.0, quantity: 1, discount: 0 },
    { id: "0006", name: "B (Barcode)", price: 80.0, quantity: 1, discount: 0 },
  ]);

  const [selectedProduct, setSelectedProduct] = useState(""); // ✅ State for dropdown selection
  const [isPopupOpen, setPopupOpen] = useState(false);

  // ✅ Update quantity & recalculate total price
  const handleQuantityChange = (index, value) => {
    setCart((prevCart) =>
      prevCart.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, value) } : item
      )
    );
  };

  // ✅ Handle product selection
  const handleProductSelect = (event) => {
    const selectedValue = event.target.value;
    setSelectedProduct(selectedValue);

    // Check if product is already in the cart
    const existingProduct = cart.find((item) => item.id === selectedValue);

    if (!existingProduct) {
      const newProduct =
        selectedValue === "Product1"
          ? { id: "P1", name: "Product 1", price: 150.0, quantity: 1, discount: 0 }
          : selectedValue === "Product2"
          ? { id: "P2", name: "Product 2", price: 200.0, quantity: 1, discount: 0 }
          : null;

      if (newProduct) {
        setCart((prevCart) => [...prevCart, newProduct]);
      }
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity - item.discount, 0).toFixed(2);
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
    <option value="Product1">Product 1</option>
    <option value="Product2">Product 2</option>
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
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-500">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                      className="w-20 p-2 text-center border rounded-md bg-white text-black"
                    />
                  </td>
                  <td className="px-4 py-3">{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
              <input type="text" placeholder="Enter PhoneNo" className="w-full p-3 border border-gray-300 rounded-lg" /> <br></br>
              <label htmlFor="username">Cash Payment (C) : </label>
              <input type="number" placeholder="Enter Cash" className="w-full p-3 border border-gray-300 rounded-lg" /><br></br>
              <label htmlFor="username">Card Payment : </label> 
              <input type="number" placeholder="" className="w-full p-3 border border-gray-300 rounded-lg" /><br></br> 
              <br></br>
              <input type="number" placeholder="" className="w-full p-3 border border-gray-300 rounded-lg" /><br></br>
              <label htmlFor="username">Gift Voucher : </label>
              <input type="number" placeholder="VoucherID" className="w-full p-3 border border-gray-300 rounded-lg" /><br></br>
            </div>

            <p className="text-lg font-bold text-red-600 bg-red-100 border-red-500 p-3 rounded-md mt-4">
              Balance: LKR -200
            </p>

            <div className="flex justify-end gap-4 mt-4">
              <button className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500" onClick={() => setPopupOpen(false)}>
                Close
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
