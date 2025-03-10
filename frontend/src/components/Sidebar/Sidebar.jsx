import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronDown, HiChevronRight } from 'react-icons/hi';
import { House, IdCard, UsersRound, Sailboat,ChartNoAxesColumnIncreasing,Gift,Download,Icon,Copy } from 'lucide-react';
import { planet } from '@lucide/lab';
import logo from '/logo.png';

const Sidepanel = ({ isSidebarOpen, toggleSidebar }) => {
  // State to handle toggling of each sub-menu
  const [isHomeOpen, setIsHomeOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isVouchersOpen, setIsVouchersOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isStoresOpen, setIsStoresOpen] = useState(false);
  const [isStoreTypesOpen, setIsStoreTypesOpen] = useState(false);

  return (
    <div className={`sidebar ${isSidebarOpen ? 'w-64' : 'w-20'} fixed left-0 top-0 bottom-0 bg-secondary transition-all duration-300 z-10`}>
      <div className="flex flex-col items-center p-4">
        {/* Logo Section */}
        <img src={logo} alt="CeylonX Logo"className={`logo transition-all duration-300 ${isSidebarOpen ? 'logo-large' : 'logo-small'}`}/>

        {/* Menu Items */}
        <div className="flex flex-col mt-4 w-full">
          {/* Home with Sub-menu */}
          <div className="menu-item flex items-center p-2 hover:bg-blue-50 rounded" onClick={() => setIsHomeOpen(!isHomeOpen)}>
            <House size={20} className="mr-4" />
            {isSidebarOpen && <span className="ml-3">Home</span>}
          </div>
          {isHomeOpen && isSidebarOpen && (
            <div className="sub-menu pl-8 mt-2">
            <Link to="/AdminPanel/" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
  <span>Dashboard</span>
</Link>
<Link to="/AdminPanel/CashInHand" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
  <span>Cash In Hand</span>
</Link>
<Link to="/AdminPanel/SalesProfit" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
  <span>Sales/Profit</span>
</Link>
<Link to="/AdminPanel/ProfitLossReport" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
  <span>Profit & Loss Report</span>
</Link>
<Link to="/AdminPanel/ProductMovement" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
  <span>Product Movement</span>
</Link>
            </div>
          )}

          {/* Sales/Profit with Sub-menu */}
          <div className="menu-item flex items-center p-2 hover:bg-blue-50 rounded" onClick={() => setIsSalesOpen(!isSalesOpen)}>
            <ChartNoAxesColumnIncreasing size={20} className="mr-4" />
            {isSidebarOpen && <span className="ml-3"> Sales/Profit</span>}
          </div>
          {isSalesOpen && isSidebarOpen && (
            <div className="sub-menu pl-8 mt-2">
              <Link to="/AdminPanel/POS" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
                <span>POS</span>
              </Link>
              <Link to="/AdminPanel/POSReturn" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
                <span>POS Return</span>
              </Link>
              <Link to="/AdminPanel/POSReceipts" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
                <span>POS Receipts</span>
              </Link>
              <Link to="/AdminPanel/POSReorders" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
                <span>POS Reorders</span>
              </Link>
              <Link to="/AdminPanel/POSExpenses" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
                <span>POS Expenses</span>
              </Link>
            </div>
          )}

          {/* Vouchers */}
          <div className="menu-item flex items-center p-2 hover:bg-blue-50 rounded" onClick={() => setIsVouchersOpen(!isVouchersOpen)}>
            <Gift size={20} className="mr-4" />
            {isSidebarOpen && <span className="ml-3">Vouchers</span>}
          </div>
          {isVouchersOpen && isSidebarOpen && (
            <div className="sub-menu pl-8 mt-2">
              <Link to="/AdminPanel/VoucherList" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
                <span>Voucher List</span>
              </Link>
              <Link to="/AdminPanel/AddVouchers" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
                <span>Add Vouchers</span>
              </Link>
            </div>
          )}

          {/* User Management */}
          <div className="menu-item flex items-center p-2 hover:bg-blue-50 rounded" onClick={() => setIsUserManagementOpen(!isUserManagementOpen)}>
            <UsersRound size={20} className="mr-4" />
            {isSidebarOpen && <span className="ml-3">User Management</span>}
          </div>
          {isUserManagementOpen && isSidebarOpen && (
            <div className="sub-menu pl-8 mt-2">
              <Link to="/AdminPanel/Profile" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
                <span>Profile</span>
              </Link>
              <Link to="/AdminPanel/SalesRepList" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
                <span>Sales Rep List</span>
              </Link>
              <Link to="/AdminPanel/New" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
                <span>New</span>
              </Link>
            </div>
          )}

          {/* Other Links with Sub-options */}
<div>
  {/* Contacts with Sub-menu */}
  <div className="menu-item flex items-center p-2 hover:bg-blue-50 rounded" onClick={() => setIsContactsOpen(!isContactsOpen)}>
    <IdCard size={20} className="mr-4" />
    {isSidebarOpen && <span className="ml-3">Contacts</span>}
  </div>
  {isContactsOpen && isSidebarOpen && (
    <div className="sub-menu pl-8 mt-2">
      <Link to="/AdminPanel/CustomerList" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>Customer List</span>
      </Link>
      <Link to="/AdminPanel/NewCustomer" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>New</span>
      </Link>
    </div>
  )}

  {/* Products with Sub-menu */}
  <div className="menu-item flex items-center p-2 hover:bg-blue-50 rounded" onClick={() => setIsProductsOpen(!isProductsOpen)}>
    <Copy size={20} className="mr-4" />
    {isSidebarOpen && <span className="ml-3">Products</span>}
  </div>
  {isProductsOpen && isSidebarOpen && (
    <div className="sub-menu pl-8 mt-2">
      <Link to="/AdminPanel/ProductsList" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>Products List</span>
      </Link>
      <Link to="/AdminPanel/CreateProducts" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>New</span>
      </Link>
      <Link to="/AdminPanel/CategoryList" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>Category List</span>
      </Link>
      <Link to="/AdminPanel/CreateCategory" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>New</span>
      </Link>
    </div>
  )}

  {/* Purchases with Sub-menu */}
  <div className="menu-item flex items-center p-2 hover:bg-blue-50 rounded" onClick={() => setIsPurchasesOpen(!isPurchasesOpen)}>
    <Download size={20} className="mr-4" />
    {isSidebarOpen && <span className="ml-3">Purchases</span>}
  </div>
  {isPurchasesOpen && isSidebarOpen && (
    <div className="sub-menu pl-8 mt-2">
      <Link to="/AdminPanel/PurchaseBills" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>Purchase Bills</span>
      </Link>
      <Link to="/AdminPanel/ProductIn" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>Product In</span>
      </Link>
      <Link to="/AdminPanel/ProductReturn" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>Product Return</span>
      </Link>
    </div>
  )}

  {/* Supplier with Sub-menu */}
  <div className="menu-item flex items-center p-2 hover:bg-blue-50 rounded" onClick={() => setIsSupplierOpen(!isSupplierOpen)}>
    <Sailboat size={20} className="mr-4" />
    {isSidebarOpen && <span className="ml-3">Supplier</span>}
  </div>
  {isSupplierOpen && isSidebarOpen && (
    <div className="sub-menu pl-8 mt-2">
      <Link to="/AdminPanel/SupplierList" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>SupplierList</span>
      </Link>
      <Link to="/AdminPanel/CreateSupplier" className="menu-item flex items-center p-2 hover:bg-blue-100 rounded">
        <span>New</span>
      </Link>
    </div>
  )}

     {/* Setup Dropdown */}
     <div 
          className="menu-item flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer"
          onClick={() => setIsSetupOpen(!isSetupOpen)}
        >
          <Icon iconNode={planet} size={20} className="mr-4" />
          {isSidebarOpen && <span className="text-sm">Setup</span>}
        </div>
        {isSetupOpen && (
          <div className="ml-6 space-y-2">
            {/* Stores Dropdown */}
            <div
              className="menu-item flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer"
              onClick={() => setIsStoresOpen(!isStoresOpen)}
            >
              <span className="text-sm">Stores</span>
              {isStoresOpen ? <HiChevronDown className="ml-auto" /> : <HiChevronRight className="ml-auto" />}
            </div>
            {isStoresOpen && (
              <div className="sub-menu ml-6 space-y-2">
                <Link to="/AdminPanel/StoreList" className="menu-item flex items-center p-2 hover:bg-blue-200 rounded">
                  <span className="text-sm text-blue-600">Store List</span>
                </Link>
                <Link to="/AdminPanel/CreateStore" className="menu-item flex items-center p-2 hover:bg-blue-200 rounded">
                  <span className="text-sm">New</span>
                </Link>
              </div>
            )}

            {/* Store Types Dropdown */}
            <div
              className="menu-item flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer"
              onClick={() => setIsStoreTypesOpen(!isStoreTypesOpen)}
            >
              <span className="text-sm">Store Types</span>
              {isStoreTypesOpen ? <HiChevronDown className="ml-auto" /> : <HiChevronRight className="ml-auto" />}
            </div>
            {isStoreTypesOpen && (
              <div className="sub-menu ml-6 space-y-2">
                <Link to="/AdminPanel/StoreType" className="menu-item flex items-center p-2 hover:bg-blue-200 rounded">
                  <span className="text-sm">Store Types</span>
                </Link>
                <Link to="/AdminPanel/CreateStoreTypes" className="menu-item flex items-center p-2 hover:bg-blue-200 rounded">
                  <span className="text-sm">New</span>
                </Link>
              </div>
            )}
             </div>
        )}
</div>

        </div>
      </div>
    </div>
  );
};

export default Sidepanel;