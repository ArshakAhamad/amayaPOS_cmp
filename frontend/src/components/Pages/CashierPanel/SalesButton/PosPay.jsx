import { v4 as uuidv4 } from "uuid";
import React, { useState, useEffect, useContext } from "react";
import Popup from "reactjs-popup";
import { motion } from "framer-motion";
import Select from "react-select";
import "reactjs-popup/dist/index.css";
import { CartContext } from "../../../../contexts/CartContext";
import { useNavigate, useLocation } from "react-router-dom";

const PosPay = () => {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [cashPayment, setCashPayment] = useState("");
  const [cardPayment, setCardPayment] = useState("");
  const [giftVoucher, setGiftVoucher] = useState("");
  const [voucherDetails, setVoucherDetails] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [heldOrders, setHeldOrders] = useState([]);
  const [isHoldOrderPopupOpen, setHoldOrderPopupOpen] = useState(false);
  const [editingRows, setEditingRows] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Check for returned customer data after navigation
  useEffect(() => {
    if (location.state?.customer) {
      const { phone, name } = location.state.customer;
      setCustomerPhone(phone);
      setCustomerName(name);
      setIsNewCustomer(false);
      // Reopen the payment popup if it was open before navigation
      setPopupOpen(true);
      // Clear the state to prevent reuse
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Format products for react-select
  const allProducts = products.map((product) => ({
    value: product.id,
    label: `${product.product_name} (LKR ${product.price.toFixed(2)})`,
    price: product.price,
  }));

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          console.error("Failed to fetch products:", data.message);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Calculate total
  const calculateTotal = () => {
    return cart
      .reduce((sum, product) => sum + product.price * product.quantity, 0)
      .toFixed(2);
  };

  // Validate voucher
  const validateVoucher = async (voucherCode) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/vouchers/${voucherCode}`
      );
      const data = await response.json();

      if (data.success) {
        const voucher = {
          ...data.voucher,
          value: parseFloat(data.voucher.value),
        };
        setVoucherDetails(voucher);
        setVoucherError("");
        return voucher;
      } else {
        setVoucherDetails(null);
        setVoucherError(data.message || "Invalid voucher");
        return null;
      }
    } catch (err) {
      console.error("Error validating voucher:", err);
      setVoucherError("Error validating voucher");
      setVoucherDetails(null);
      return null;
    }
  };

  // Check customer by phone
  const checkCustomer = async (phone) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/customers?phone=${phone}`
      );
      const data = await response.json();

      if (data.success && data.customers.length > 0) {
        const exactMatch = data.customers.find(
          (customer) => customer.customer_phone.trim() === phone.trim()
        );

        if (exactMatch) {
          setCustomerName(exactMatch.customer_name);
          setIsNewCustomer(false);
        } else {
          setCustomerName("");
          setIsNewCustomer(true);
        }
      } else {
        setCustomerName("");
        setIsNewCustomer(true);
      }
    } catch (err) {
      console.error("Error checking customer:", err);
      setCustomerName("");
      setIsNewCustomer(false);
    }
  };

  // Handle product selection
  const handleProductSelect = (selectedOption) => {
    if (!selectedOption) return;
    const selectedProduct = products.find(
      (product) => product.id === selectedOption.value
    );

    if (selectedProduct) {
      const isProductInCart = cart.some(
        (product) => product.id === selectedProduct.id
      );

      if (!isProductInCart) {
        addToCart({
          id: selectedProduct.id,
          name: selectedProduct.product_name,
          price: selectedProduct.price,
          quantity: 1,
          discount: 0,
        });
      } else {
        alert("Product is already in the cart.");
      }
    }
  };

  // Handle product edit
  const handleProductEdit = (selectedOption, index) => {
    if (!selectedOption) return;
    const selectedProduct = products.find(
      (product) => product.id === selectedOption.value
    );

    if (selectedProduct) {
      const updatedCart = [...cart];
      updatedCart[index] = {
        id: selectedProduct.id,
        name: selectedProduct.product_name,
        price: selectedProduct.price,
        quantity: updatedCart[index].quantity,
        discount: 0,
      };
    }
  };

  // Handle payment
  const handlePayment = async () => {
    const paymentMethod = cashPayment ? "Cash" : "Card";
    const subtotal = parseFloat(calculateTotal());
    const voucherAmount = voucherDetails ? voucherDetails.value : 0;
    const totalAmount = Math.max(0, subtotal - voucherAmount);

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
          customer: customerName || "Walk-In-Customer",
          phone: customerPhone,
          receiptNumber: 2865,
          cash: cashPayment,
          card: cardPayment,
          voucher_id: voucherDetails?.id || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Payment successful! 
               Total: LKR ${subtotal.toFixed(2)}
               Voucher: -LKR ${voucherAmount.toFixed(2)}
               Amount Paid: LKR ${totalAmount.toFixed(2)}`);

        setPopupOpen(false);
        setCustomerPhone("");
        setCustomerName("");
        setIsNewCustomer(false);
        setCashPayment("");
        setCardPayment("");
        setGiftVoucher("");
        setVoucherDetails(null);
        clearCart();
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

    const orderId = uuidv4();
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
            <div className="mt-2">
              <Select
                options={allProducts}
                onChange={handleProductSelect}
                placeholder="Select Product 🔍"
                isClearable
                className="basic-single"
                classNamePrefix="select"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
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
                    <span>Order #{order.id.slice(0, 8)}</span>
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
                <th className="px-4 py-2 text-left">Actions</th>
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
                  <tr
                    key={`${product.id}-${index}`}
                    className="border-b border-gray-500"
                  >
                    <td className="px-4 py-3">
                      {editingRows[index] ? (
                        <Select
                          options={allProducts}
                          value={allProducts.find(
                            (opt) => opt.value === product.id
                          )}
                          onChange={(selectedOption) =>
                            handleProductEdit(selectedOption, index)
                          }
                          placeholder="Select Product"
                          isClearable
                          className="basic-single"
                          classNamePrefix="select"
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: "42px",
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
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="p-2">{product.name}</span>
                        </div>
                      )}
                    </td>
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
                    <td className="px-4 py-3 flex space-x-2">
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeFromCart(product.id)}
                      >
                        (X)
                      </button>
                      {editingRows[index] && (
                        <button
                          className="text-gray-300 hover:text-white text-sm"
                          onClick={() =>
                            setEditingRows({ ...editingRows, [index]: false })
                          }
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right Section (Payment Panel) */}
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
                <span className="font-bold">
                  {voucherDetails
                    ? `(${voucherDetails.value.toFixed(2)})`
                    : "(0.00)"}
                </span>
              </p>
            </div>

            <div>
              <span>_______________________________________</span>
            </div>

            <div className="border-t border-gray-600 py-3">
              <p className="flex justify-between font-semibold">
                <span>Net:</span>
                <span className="text-lg text-yellow-400 font-bold">
                  LKR{" "}
                  {(
                    parseFloat(calculateTotal()) -
                    (voucherDetails ? parseFloat(voucherDetails.value) : 0)
                  ).toFixed(2)}
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

            {/* Voucher Section */}
            <div className="mt-4">
              <h3>Pay Gift Voucher</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Voucher Code"
                  className="flex-1 p-3 border border-gray-400 rounded-md"
                  value={giftVoucher}
                  onChange={(e) => setGiftVoucher(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") validateVoucher(giftVoucher);
                  }}
                />
                <button
                  onClick={() => validateVoucher(giftVoucher)}
                  className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>

              {voucherError && (
                <p className="text-red-500 text-sm mt-1">{voucherError}</p>
              )}

              {voucherDetails && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mt-2">
                  <p className="font-bold">Voucher Applied:</p>
                  <p>Code: {voucherDetails.code}</p>
                  <p>Amount: LKR {voucherDetails.value.toFixed(2)}</p>
                  <p>Valid for: {voucherDetails.valid_days} days</p>
                </div>
              )}
            </div>

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
          </div>
        </div>
      </div>

      {/* Payment Popup */}
      <Popup
        open={isPopupOpen}
        closeOnDocumentClick
        onClose={() => {
          setPopupOpen(false);
          setCustomerPhone("");
          setCustomerName("");
          setIsNewCustomer(false);
          setCashPayment("");
          setCardPayment("");
        }}
        modal
        lockScroll
        contentStyle={{
          maxWidth: "500px",
          width: "90%",
          padding: "15px",
          height: "80vh",
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
        {(close) => {
          const totalAmount = parseFloat(calculateTotal());
          const voucherAmount = voucherDetails
            ? parseFloat(voucherDetails.value)
            : 0;
          const cashAmount = parseFloat(cashPayment) || 0;
          const balance = cashAmount - (totalAmount - voucherAmount);

          const balanceClass =
            balance >= 0
              ? "text-green-600 bg-green-100 border-green-500"
              : "text-red-600 bg-red-100 border-red-500";

          const balanceMessage =
            balance >= 0
              ? `Change: LKR ${balance.toFixed(2)}`
              : `Balance Due: LKR ${Math.abs(balance).toFixed(2)}`;

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full"
            >
              <h3 className="text-xl font-semibold mb-4">PAYMENT DETAILS</h3>
              <span>
                ----------------------------------------------------------------------------
              </span>
              <div className="w-full mb-4 bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>LKR {parseFloat(calculateTotal()).toFixed(2)}</span>
                </div>

                {voucherDetails && (
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">
                      Voucher Discount ({voucherDetails.code}):
                    </span>
                    <span className="text-green-600">
                      -LKR {parseFloat(voucherDetails.value).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                  <span>Total:</span>
                  <span>
                    LKR{" "}
                    {(
                      parseFloat(calculateTotal()) -
                      (voucherDetails ? parseFloat(voucherDetails.value) : 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              <span>
                ----------------------------------------------------------------------------
              </span>

              <div className="w-full flex flex-col space-y-4">
                <div>
                  <label className="block text-left mb-1 font-medium">
                    Customer Phone:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter Phone Number"
                      className="flex-1 p-3 border border-gray-300 rounded-lg"
                      value={customerPhone}
                      onChange={(e) => {
                        const phone = e.target.value;
                        setCustomerPhone(phone);
                        if (phone.length >= 10) {
                          checkCustomer(phone);
                        } else {
                          setCustomerName("");
                          setIsNewCustomer(false);
                        }
                      }}
                    />
                    {isNewCustomer && (
                      <button
                        className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600"
                        onClick={() => {
                          close();
                          navigate("/CashierPanel/NewCustomer", {
                            state: {
                              returnPath: "/CashierPanel/PosPay",
                              phone: customerPhone,
                            },
                          });
                        }}
                      >
                        New Customer
                      </button>
                    )}
                  </div>
                  {customerName && (
                    <p className="text-left mt-1 text-green-600">
                      Existing Customer: {customerName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-left mb-1 font-medium">
                      Cash Amount:
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Cash Amount"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={cashPayment}
                      onChange={(e) => setCashPayment(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-left mb-1 font-medium">
                      Card Number:
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Card Number"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={cardPayment}
                      onChange={(e) => setCardPayment(e.target.value)}
                    />
                  </div>
                </div>

                {voucherDetails && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                    <p className="font-bold">Voucher Applied:</p>
                    <p>Code: {voucherDetails.code}</p>
                    <p>Amount: LKR {voucherDetails.value.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div
                className={`w-full mt-4 p-3 rounded-md border ${balanceClass}`}
              >
                <p className="text-lg font-bold">{balanceMessage}</p>
                {balance >= 0 && (
                  <p className="text-sm mt-1">
                    Please give customer {balanceMessage}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
                  onClick={() => {
                    close();
                    setCustomerPhone("");
                    setCustomerName("");
                    setIsNewCustomer(false);
                    setCashPayment("");
                    setCardPayment("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className={`px-6 py-2 text-white rounded-md transition-colors ${
                    balance >= 0
                      ? "bg-blue-600 hover:bg-blue-700"
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
