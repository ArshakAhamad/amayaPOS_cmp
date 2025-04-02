import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './components/Auth/Login';
import Sidepanel from './components/Sidebar/Sidebar'; // Admin Sidebar
import SidebarCashier from './components/Sidebar/SidebarCashier'; // Cashier Sidebar
import Topbar from './components/Navigation/Topbar';
import Footer from './components/Navigation/footer';

// Admin Pages
import Dashboard from './components/Pages/AdminPanel/HomeButton/Dashboard';
import CashInHand from './components/Pages/AdminPanel/HomeButton/CashInHand';
import SalesProfit from './components/Pages/AdminPanel/HomeButton/SalesProfit';
import ProfitLossReport from './components/Pages/AdminPanel/HomeButton/ProfitLossReport';
import ProductMovement from './components/Pages/AdminPanel/HomeButton/ProductMovement';
import POS from './components/Pages/AdminPanel/Sales&ProfitButton/POS';
import POSReturn from './components/Pages/AdminPanel/Sales&ProfitButton/POSReturn';
import POSReceipts from './components/Pages/AdminPanel/Sales&ProfitButton/POSReceipts';
import POSReorders from './components/Pages/AdminPanel/Sales&ProfitButton/POSReorders';
import POSExpenses from './components/Pages/AdminPanel/Sales&ProfitButton/POSExpenses';
import VoucherList from './components/Pages/AdminPanel/VoucherButton/VoucherList';
import AddVouchers from './components/Pages/AdminPanel/VoucherButton/AddVouchers';
import Profile from './components/Pages/AdminPanel/UserManagement/Profile';
import SalesRepList from './components/Pages/AdminPanel/UserManagement/SalesRepList';
import NewSalesRep from './components/Pages/AdminPanel/UserManagement/New';
import CustomerList from './components/Pages/AdminPanel/ContactsButton/CustomerList';
import NewCustomer from './components/Pages/AdminPanel/ContactsButton/NewCustomer';
import ProductList from './components/Pages/AdminPanel/ProductsButton/ProductsList';
import CreateProducts from './components/Pages/AdminPanel/ProductsButton/CreateProducts';
import CategoryList from './components/Pages/AdminPanel/ProductsButton/CategoryList';
import CreateCategory from './components/Pages/AdminPanel/ProductsButton/CreateCategory';
import PurchaseBills from './components/Pages/AdminPanel/Purchase Button/PurchaseBills';
import ProductIn from './components/Pages/AdminPanel/Purchase Button/ProductIn';
import ProductReturn from './components/Pages/AdminPanel/Purchase Button/ProductReturn';
import SupplierList from './components/Pages/AdminPanel/SupplierButton/SupplierList';
import CreateSupplier from './components/Pages/AdminPanel/SupplierButton/CreateSupplier';
import StoreList from './components/Pages/AdminPanel/SetupButton/StoreList';
import CreateStore from './components/Pages/AdminPanel/SetupButton/CreateStore';
import StoreType from './components/Pages/AdminPanel/SetupButton/StoreType';
import CreateStoreTypes from './components/Pages/AdminPanel/SetupButton/CreateStoreTypes';

// Cashier Pages
import CashierDashboard from './components/Pages/CashierPanel/HomeButton/Dashboard';
import CashierCashInHand from './components/Pages/CashierPanel/HomeButton/CashInHand';
import CashierPOS from './components/Pages/CashierPanel/SalesButton/POS';
import CashierPOSReceipts from './components/Pages/CashierPanel/SalesButton/POSReceipts';
import CashierPOSReorders from './components/Pages/CashierPanel/SalesButton/POSReorders';
import CashierPOSExpenses from './components/Pages/CashierPanel/SalesButton/POSExpenses';
import CashierAddVouchers from './components/Pages/CashierPanel/VouchersButton/AddVouchers';
import CashierVoucherList from './components/Pages/CashierPanel/VouchersButton/VoucherList';
import CashierProfile from './components/Pages/CashierPanel/UserManagementButton/Profile';
import CashierSalesRepList from './components/Pages/CashierPanel/UserManagementButton/SalesRepList';
import CashierNewSalesRep from './components/Pages/CashierPanel/UserManagementButton/New';
import CashierCustomerList from './components/Pages/CashierPanel/ContactsButton/CustomerList';
import CashierNewCustomer from './components/Pages/CashierPanel/ContactsButton/NewCustomer';
import "./index.css";
import "./App.css";
import PosPay from './components/Pages/AdminPanel/Sales&ProfitButton/PosPay';
import CashierPosPay from './components/Pages/CashierPanel/SalesButton/PosPay';
import CashierPOSReturn from './components/Pages/CashierPanel/SalesButton/POSReturn';
import  {Logout}  from './components/Auth/Logout';
import SupplierHY from './components/Pages/AdminPanel/SupplierButton/SupplierBills';

// Import the CartProvider
import { CartProvider } from './contexts/CartContext';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState(null); // Track user role (Admin/Cashier)
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status

  // Debug: Log state changes
  React.useEffect(() => {
    console.log("isAuthenticated:", isAuthenticated);
    console.log("userRole:", userRole);
  }, [isAuthenticated, userRole]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <CartProvider> {/* Wrap the entire app with CartProvider */}
      <Router>
        <Routes>
          {/* Login Route */}
          <Route
            path="/Login"
            element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />}
          />

          {/* Logout Route */}
          <Route
            path="/Logout"
            element={<Logout setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />}
          />

          {/* Redirect to Login if not authenticated, otherwise redirect to the correct panel */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={userRole === "Admin" ? "/AdminPanel" : "/CashierPanel"} replace />
              ) : (
                <Navigate to="/Login" replace />
              )
            }
          />

          {/* Admin Panel Routes */}
          <Route
            path="/AdminPanel/*"
            element={
              isAuthenticated && userRole === "Admin" ? (
                <AdminLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setUserRole={setUserRole} />
              ) : (
                <Navigate to="/Login" replace />
              )
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="CashInHand" element={<CashInHand />} />
            <Route path="SalesProfit" element={<SalesProfit />} />
            <Route path="ProfitLossReport" element={<ProfitLossReport />} />
            <Route path="ProductMovement" element={<ProductMovement />} />
            <Route path="POS" element={<POS />} />
            <Route path="PosPay" element={<PosPay />} />
            <Route path="POSReturn" element={<POSReturn />} />
            <Route path="POSReceipts" element={<POSReceipts />} />
            <Route path="POSReorders" element={<POSReorders />} />
            <Route path="POSExpenses" element={<POSExpenses />} />
            <Route path="VoucherList" element={<VoucherList />} />
            <Route path="AddVouchers" element={<AddVouchers />} />
            <Route path="Profile" exact element={<Profile />} />
            <Route path="SalesRepList" exact element={<SalesRepList />} />
            <Route path="New" exact element={<NewSalesRep />} />
            <Route path="CustomerList" exact element={<CustomerList />} />
            <Route path="NewCustomer" exact element={<NewCustomer />} />
            <Route path="ProductsList" exact element={<ProductList />} />
            <Route path="CreateProducts" exact element={<CreateProducts />} />
            <Route path="CategoryList" exact element={<CategoryList />} />
            <Route path="CreateCategory" exact element={<CreateCategory />} />
            <Route path="PurchaseBills" exact element={<PurchaseBills />} />
            <Route path="ProductIn" exact element={<ProductIn />} />
            <Route path="ProductReturn" exact element={<ProductReturn />} />
            <Route path="SupplierList" exact element={<SupplierList />} />
            <Route path="CreateSupplier" exact element={<CreateSupplier />} />
            <Route path="SupplierBills" exact element={<SupplierHY />} />
            <Route path="StoreList" exact element={<StoreList />} />
            <Route path="CreateStore" exact element={<CreateStore />} />
            <Route path="StoreType" exact element={<StoreType />} />
            <Route path="CreateStoreTypes" exact element={<CreateStoreTypes />} />
          </Route>

          {/* Cashier Panel Routes */}
          <Route
            path="/CashierPanel/*"
            element={
              isAuthenticated && userRole === "Cashier" ? (
                <CashierLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setUserRole={setUserRole} />
              ) : (
                <Navigate to="/Login" replace />
              )
            }
          >
            <Route index element={<CashierDashboard />} />
            <Route path="CashInHand" element={<CashierCashInHand />} />
            <Route path="ProductMovement" element={<ProductMovement />} />
            <Route path="POS" element={<CashierPOS />} />
            <Route path="PosPay" element={<CashierPosPay />} />
            <Route path="POSReturn" element={<CashierPOSReturn />} />
            <Route path="POSReceipts" element={<CashierPOSReceipts />} />
            <Route path="POSReorders" element={<CashierPOSReorders />} />
            <Route path="POSExpenses" element={<CashierPOSExpenses />} />
            <Route path="VoucherList" element={<CashierVoucherList />} />
            <Route path="AddVouchers" element={<CashierAddVouchers />} />
            <Route path="Profile" element={<CashierProfile />} />
            <Route path="SalesRepList" element={<CashierSalesRepList />} />
            <Route path="New" element={<CashierNewSalesRep />} />
            <Route path="CustomerList" element={<CashierCustomerList />} />
            <Route path="NewCustomer" element={<CashierNewCustomer />} />
          </Route>

          {/* Handle Undefined Routes (404) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

// Admin Layout Component
const AdminLayout = ({ isSidebarOpen, toggleSidebar, setUserRole }) => (
  <div className="flex">
    <Sidepanel isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    <div className="main-content flex-1 transition-all duration-300">
      <Topbar
        toggleSidebar={toggleSidebar}
        setUserRole={setUserRole}
        userRole="Admin"
        isSidebarOpen={isSidebarOpen}
      />
      <div className="p-8">
        <Outlet />
      </div>
      <Footer />
    </div>
  </div>
);

// Cashier Layout Component
const CashierLayout = ({ isSidebarOpen, toggleSidebar, setUserRole }) => (
  <div className="flex">
    <SidebarCashier isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    <div className={`main-content transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-20 w-[calc(100%-5rem)]'}`}>
      <Topbar
        toggleSidebar={toggleSidebar}
        setUserRole={setUserRole}
        userRole="Cashier"
        isSidebarOpen={isSidebarOpen}
      />
      <div className="p-8">
        <Outlet />
      </div>
      <Footer />
    </div>
  </div>
);

export default App;