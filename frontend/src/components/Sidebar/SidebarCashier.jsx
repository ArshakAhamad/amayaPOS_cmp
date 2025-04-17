import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiHome,
  HiArrowRight,
  HiDocumentText,
  HiCube,
  HiTruck,
} from "react-icons/hi";
import {
  House,
  IdCard,
  UsersRound,
  Sailboat,
  ChartNoAxesColumnIncreasing,
  Gift,
  Download,
  Icon,
  Copy,
} from "lucide-react";
import logo from "/logo.png";

const SidebarCashier = ({ isSidebarOpen, toggleSidebar }) => {
  // State to handle toggling of each sub-menu
  const [isHomeOpen, setIsHomeOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isVouchersOpen, setIsVouchersOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  return (
    <div
      className={`sidebar ${
        isSidebarOpen ? "w-64" : "w-20"
      } fixed left-0 top-0 bottom-0 bg-secondary transition-all duration-300 z-10`}
    >
      <div className="flex flex-col items-center p-4">
        {/* Logo Section */}
        <img
          src={logo}
          alt="CeylonX Logo"
          className={`logo transition-all duration-300 ${
            isSidebarOpen ? "logo-large" : "logo-small"
          }`}
        />

        {/* Menu Items */}
        <div className="flex flex-col mt-4 w-full">
          {/* Home with Sub-menu */}
          <div
            className="menu-item flex items-center p-2 hover:bg-blue-50 rounded"
            onClick={() => setIsHomeOpen(!isHomeOpen)}
          >
            <House size={20} className="mr-4" />
            {isSidebarOpen && <span className="ml-3">Home</span>}
          </div>
          {isHomeOpen && isSidebarOpen && (
            <div className="sub-menu pl-8 mt-2">
              <Link
                to="/CashierPanel/"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>Dashboard</span>
              </Link>
              <Link
                to="/CashierPanel/CashInHand"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>Cash In Hand</span>
              </Link>
              <Link
                to="/CashierPanel/ProductMovement"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>Product Movement</span>
              </Link>
            </div>
          )}

          {/* Sales/Profit with Sub-menu */}
          <div
            className="menu-item flex items-center p-2 hover:bg-blue-50 rounded"
            onClick={() => setIsSalesOpen(!isSalesOpen)}
          >
            <ChartNoAxesColumnIncreasing size={20} className="mr-4" />
            {isSidebarOpen && <span className="ml-3">Sales/Profit</span>}
          </div>
          {isSalesOpen && isSidebarOpen && (
            <div className="sub-menu pl-8 mt-2">
              <Link
                to="/CashierPanel/POS"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>POS</span>
              </Link>
              <Link
                to="/CashierPanel/POSReturn"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>POS Return</span>
              </Link>
              <Link
                to="/CashierPanel/POSReceipts"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>POS Receipts</span>
              </Link>
              <Link
                to="/CashierPanel/POSReorders"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>POS Reorders</span>
              </Link>
              <Link
                to="/CashierPanel/POSExpenses"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>POS Expenses</span>
              </Link>
            </div>
          )}

          {/* Vouchers */}
          <div
            className="menu-item flex items-center p-2 hover:bg-blue-50 rounded"
            onClick={() => setIsVouchersOpen(!isVouchersOpen)}
          >
            <Gift size={20} className="mr-4" />
            {isSidebarOpen && <span className="ml-3">Vouchers</span>}
          </div>
          {isVouchersOpen && isSidebarOpen && (
            <div className="sub-menu pl-8 mt-2">
              <Link
                to="/CashierPanel/VoucherList"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>Voucher List</span>
              </Link>
              <Link
                to="/CashierPanel/AddVouchers"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>Add Vouchers</span>
              </Link>
            </div>
          )}

          {/* User Management */}
          <div
            className="menu-item flex items-center p-2 hover:bg-blue-50 rounded"
            onClick={() => setIsUserManagementOpen(!isUserManagementOpen)}
          >
            <UsersRound size={20} className="mr-4" />
            {isSidebarOpen && <span className="ml-3">User Management</span>}
          </div>
          {isUserManagementOpen && isSidebarOpen && (
            <div className="sub-menu pl-8 mt-2">
              <Link
                to="/CashierPanel/Profile"
                className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
              >
                <span>Profile</span>
              </Link>
            </div>
          )}

          <div>
            {/* Contacts with Sub-menu */}
            <div
              className="menu-item flex items-center p-2 hover:bg-blue-50 rounded"
              onClick={() => setIsContactsOpen(!isContactsOpen)}
            >
              <IdCard size={20} className="mr-4" />
              {isSidebarOpen && <span className="ml-3">Contacts</span>}
            </div>
            {isContactsOpen && isSidebarOpen && (
              <div className="sub-menu pl-8 mt-2">
                <Link
                  to="/CashierPanel/CustomerList"
                  className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
                >
                  <span>Customer List</span>
                </Link>
                <Link
                  to="/CashierPanel/NewCustomer"
                  className="menu-item flex items-center p-2 hover:bg-blue-100 rounded"
                >
                  <span>New</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarCashier;
