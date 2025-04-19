import { v4 as uuidv4 } from "uuid";
import React, { useState, useEffect, useContext } from "react";
import Popup from "reactjs-popup";
import { motion } from "framer-motion";
import "reactjs-popup/dist/index.css";
import Select from "react-select";
import { Link } from "react-router-dom";
import { CartContext } from "../../../../contexts/CartContext";
import { Pencil, CreditCard } from "lucide-react";

const PosPay = () => {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [cashPayment, setCashPayment] = useState("");
  const [cardPayment, setCardPayment] = useState("");
  const [giftVoucher, setGiftVoucher] = useState("");
  const [heldOrders, setHeldOrders] = useState([]);
  const [isHoldOrderPopupOpen, setHoldOrderPopupOpen] = useState(false);

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
    return cart
      .reduce((sum, product) => sum + product.price * product.quantity, 0)
      .toFixed(2);
  };

  // Handle product selection
  const handleProductSelect = (event) => {
    const selectedValue = event.target.value;
    setSelectedProduct(selectedValue);

    const selectedProduct = products.find(
      (product) => product.id === parseInt(selectedValue)
    );

    if (selectedProduct) {
      const isProductInCart = cart.some(
        (product) => product.id === selectedProduct.id
      );

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
    const paymentMethod = cashPayment ? "Cash" : "Card";
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
          customer: "Walk-In-Customer",
          phone: customerPhone,
          receiptNumber: 2865,
          cash: cashPayment,
          cardNumber: cardPayment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Payment processed successfully!");
        setPopupOpen(false);
        setCustomerPhone("");
        setCashPayment("");
        setCardPayment("");
        setGiftVoucher("");

        // Safely clear the cart
        if (clearCart && typeof clearCart === "function") {
          clearCart();
        } else {
          // Fallback if clearCart is not available
          console.warn("clearCart function not available");
          // Alternative: Use your context's setCart if available
        }
      } else {
        alert("Payment failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment error: " + err.message);
    }
  };

  // Handle hold order
  const handleHoldOrder = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Add items before holding order.");
      return;
    }

    const orderId = uuidv4(); // Generate unique ID
    const newHeldOrder = {
      id: orderId,
      items: [...cart],
      total: calculateTotal(),
      timestamp: new Date().toLocaleString(),
    };

    setHeldOrders([...heldOrders, newHeldOrder]);
    clearCart();
    alert(`Order held successfully! Order ID: ${orderId}`);
  };

  // Retrieve held order
  const retrieveHeldOrder = (orderId) => {
    const order = heldOrders.find((order) => order.id === orderId);
    if (order) {
      order.items.forEach((item) => addToCart(item));
      setHeldOrders(heldOrders.filter((order) => order.id !== orderId));
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
            <Select
              options={products.map((product) => ({
                value: product.id,
                label: `${product.product_name} (LKR ${product.price.toFixed(
                  2
                )})`,
              }))}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  const selectedProduct = products.find(
                    (product) => product.id === selectedOption.value
                  );
                  if (selectedProduct) {
                    const isProductInCart = cart.some(
                      (product) => product.id === selectedProduct.id
                    );
                    if (!isProductInCart) {
                      const newProduct = {
                        id: selectedProduct.id,
                        name: selectedProduct.product_name,
                        price: selectedProduct.price,
                        quantity: 1,
                        discount: 0,
                      };
                      addToCart(newProduct);
                    } else {
                      alert("Product is already in the cart.");
                    }
                  }
                }
              }}
              placeholder="Select Product"
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "44px",
                  borderColor: "#d1d5db",
                  "&:hover": {
                    borderColor: "#d1d5db",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
          </div>

          {/* Held Orders Section */}
          <div className="mt-4 bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold mb-2">Held Orders</h3>
            {heldOrders.length === 0 ? (
              <p className="text-gray-500">No held orders</p>
            ) : (
              <ul className="space-y-2">
                {heldOrders.map((order) => (
                  <li
                    key={order.id}
                    className="flex justify-between items-center p-2 border-b"
                  >
                    <span>Order #{order.id.slice(0, 8)}</span> <br></br>
                    <button
                      onClick={() => retrieveHeldOrder(order.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Retrieve Order
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
                  <td colSpan="5" className="text-center py-4">
                    No items in the cart
                  </td>
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
                        onChange={(e) =>
                          updateQuantity(index, parseInt(e.target.value))
                        }
                        className="w-20 p-2 text-center border rounded-md bg-white text-black"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {(product.price * product.quantity).toFixed(2)}
                    </td>
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
            <h2 className="text-lg font-bold border-b border-gray-600 pb-2">
              AMAYA COLLECTION
            </h2>

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

            <div>
              <span>_______________________________________</span>
            </div>

            <div className="border-t border-gray-600 py-3">
              <p className="flex justify-between font-semibold">
                <span>Net:</span>
                <span className="text-lg text-yellow-400 font-bold">
                  LKR {calculateTotal()}
                </span>
              </p>
              <p className="flex justify-between">
                <span>No of Items:</span>
                <span>{cart.length}</span>
              </p>
            </div>

            <div>
              <span>_______________________________________</span>
            </div>

            <h3>Pay Gift Voucher</h3>
            <input
              type="text"
              placeholder="Voucher ID"
              className="w-full p-3 border border-gray-400 rounded-md mt-2"
            />

            <div>
              <span>___________________________________________</span>
            </div>

            {/* Pay Button */}
            <button
              className="w-full px-4 py-3 font-semibold rounded-md transition duration-300 
             border border-white text-white bg-transparent hover:bg-white hover:text-black"
              onClick={() => setPopupOpen(true)}
            >
              PAY (P)
            </button>

            <div>
              <span>___________________________________________</span>
            </div>

            {/* Hold Order Button */}
            <button
              className="w-full px-4 py-3 font-semibold rounded-md transition duration-300 
             border border-white text-white bg-blue-500 hover:bg-blue-600 mt-2"
              onClick={handleHoldOrder}
            >
              HOLD THE ORDER (H)
            </button>

            <div>
              <span>___________________________________________</span>
            </div>

            <h3>Activate Gift Card</h3>
            <input
              type="text"
              placeholder="Voucher ID"
              className="w-full p-3 border border-gray-400 rounded-md mt-2"
            />
          </div>
        </div>
      </div>

      {/* Popup for Payment */}
      <Popup
        open={isPopupOpen}
        closeOnDocumentClick
        onClose={() => {
          setPopupOpen(false);
          setCustomerPhone("");
          setCashPayment("");
          setCardPayment("");
          setGiftVoucher("");
        }}
        modal
        lockScroll
        contentStyle={{
          maxWidth: "500px",
          width: "90%",
          padding: "25px",
          height: "auto",
          maxHeight: "90vh",
          borderRadius: "16px",
          background: "white",
          boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
        overlayStyle={{
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(3px)",
        }}
      >
        {(close) => {
          const totalAmount = parseFloat(calculateTotal());
          const cashAmount = parseFloat(cashPayment) || 0;
          const balance = cashAmount - totalAmount;

          const balanceClass =
            balance >= 0
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-red-700 bg-red-50 border-red-200";

          const balanceMessage =
            balance >= 0
              ? `Change: LKR ${balance.toFixed(2)}`
              : `Balance Due: LKR ${Math.abs(balance).toFixed(2)}`;

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  Payment Details
                </h3>
                <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
              </div>

              {/* Amount Summary */}
              <div className="w-full bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    LKR {totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">
                      Total Amount:
                    </span>
                    <span className="font-bold text-lg text-blue-600">
                      LKR {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <br></br>
              {/* Payment Form */}
              <div className="w-full space-y-5">
                {/* Customer Phone */}
                <div className="relative">
                  <label
                    htmlFor="customerPhone"
                    className="block text-left text-sm font-medium text-gray-700 mb-1"
                  >
                    Customer Phone :
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      id="customerPhone"
                      placeholder="07X XXX XXXX"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                    <Link
                      to="/CashierPanel/NewCustomer"
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Create New Customer"
                    >
                      Create Customer
                      <Pencil size={18} className="text-gray-600" />
                    </Link>
                  </div>
                </div>
                <br></br>
                {/* Payment Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cash Payment */}
                  <div>
                    <label
                      htmlFor="cashPayment"
                      className="block text-left text-sm font-medium text-gray-700 mb-1"
                    >
                      Cash Amount LKR :
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500"></span>
                      <input
                        type="number"
                        id="cashPayment"
                        placeholder="0.00"
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={cashPayment}
                        onChange={(e) => setCashPayment(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <br></br>
                  {/* Card Payment */}
                  <div>
                    <label
                      htmlFor="cardPayment"
                      className="block text-left text-sm font-medium text-gray-700 mb-1"
                    >
                      Card Number :
                    </label>
                    <div className="relative">
                      <CreditCard
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-500"
                      />
                      <input
                        type="text"
                        id="cardPayment"
                        placeholder="XXXX XXXX XXXX XXXX"
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={cardPayment}
                        onChange={(e) => setCardPayment(e.target.value)}
                        pattern="[0-9]{13,19}"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </div>
                <br></br>
                {/* Gift Voucher */}
                <div>
                  <label
                    htmlFor="giftVoucher"
                    className="block text-left text-sm font-medium text-gray-700 mb-1"
                  >
                    Gift Voucher :
                  </label>
                  <input
                    type="text"
                    id="giftVoucher"
                    placeholder="Enter voucher code"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={giftVoucher}
                    onChange={(e) => setGiftVoucher(e.target.value)}
                  />
                </div>
              </div>

              {/* Balance Display */}
              <div
                className={`w-full p-4 rounded-lg border ${balanceClass} transition-all duration-200`}
              >
                <p className="font-bold text-lg">{balanceMessage}</p>
                {balance >= 0 && (
                  <p className="text-sm mt-1 text-green-600">
                    Please give customer LKR {balance.toFixed(2)} as change :
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  className={`px-6 py-2.5 text-white rounded-lg transition-colors font-medium ${
                    balance >= 0
                      ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handlePayment}
                  disabled={balance < 0}
                >
                  Complete Payment
                </button>
              </div>
            </motion.div>
          );
        }}
      </Popup>
    </div>
  );
};

export default PosPay;
