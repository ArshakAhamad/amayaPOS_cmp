import React, { useState } from "react";
import { HiMenu } from "react-icons/hi";
import {
  House,
  Box,
  CircleParking,
  ReceiptText,
  ChartNoAxesColumnIncreasing,
  Gift,
  Undo2,
  IdCard,
  UserRound,
  Copy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Topbar = ({ toggleSidebar, setUserRole, userRole, isSidebarOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Icon Click Handlers - Redirects to specific pages
  const handleIconClick = (path) => {
    navigate(path);
  };

  // ✅ Profile & Logout Handlers
  const handleProfileClick = () => navigate(`/${userRole}Panel/Profile`);
  const handleLoginClick = () => navigate("/Login");
  const handleLogoutClick = () => navigate("/Logout");
  

  // ✅ Cashier Panel Handler
  const handleCashierPanelClick = () => {
    setUserRole("Cashier"); // Update user role to Cashier
    navigate("/CashierPanel"); // Navigate to CashierPanel
  };

  // ✅ Admin Panel Handler
  const handleAdminPanelClick = () => {
    setUserRole("Admin"); // Update user role to Admin
    navigate("/AdminPanel"); // Navigate to AdminPanel
  };

  // ✅ Toggle dropdown menu
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // ✅ Dynamic Icon Paths based on User Role
  const getIconPath = (path) => {
    return `/${userRole}Panel${path}`;
  };

  return (
    <div className={`topbar ${isSidebarOpen ? "expanded" : "collapsed"}`}>
      {/* Left Side - Hamburger Menu */}
      <div className="topbar-left" onClick={toggleSidebar}>
        <HiMenu className="menu-icon" />
      </div>

      {/* ✅ Middle Icons with Clickable Navigation */}
      <div className="topbar-icons flex justify-center gap-8">
        <ChartNoAxesColumnIncreasing
          className="topbar-icon"
          onClick={() => handleIconClick(getIconPath("/POS"))}
        />
        <Gift
          className="topbar-icon"
          onClick={() => handleIconClick(getIconPath("/VoucherList"))}
        />
        <Undo2
          className="topbar-icon"
          onClick={() => handleIconClick(getIconPath("/POSReturn"))}
        />
        <IdCard
          className="topbar-icon"
          onClick={() => handleIconClick(getIconPath("/CustomerList"))}
        />
        <Copy
          className="topbar-icon"
          onClick={() => handleIconClick(getIconPath("/CashInHand"))}
        />
        <ReceiptText
          className="topbar-icon"
          onClick={() => handleIconClick(getIconPath("/POSReceipts"))}
        />
        <CircleParking
          className="topbar-icon"
          onClick={() => handleIconClick(getIconPath("/ProductMovement"))}
        />
        <Box
          className="topbar-icon"
          onClick={() => handleIconClick(getIconPath("/POSReorders"))}
        />
        <House
          className="topbar-icon"
          onClick={() => handleIconClick(getIconPath("/"))}
        />
      </div>

      {/* ✅ Right Side - Profile Info */}
      <div className="topbar-right">
        <div className="profile-menu">
          <div className="profile-trigger" onClick={toggleDropdown}>
            <UserRound className="topbar-icon profile-icon" />
            <span className="topbar-text">
              Welcome, <br />
              <strong>{userRole}</strong>
            </span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleProfileClick}>
                Profile
              </div>
              
              {userRole === "Admin" ? (
                <div className="dropdown-item" onClick={handleCashierPanelClick}>
                  CashierPanel
                </div>
              ) : (
                <div className="dropdown-item" onClick={handleAdminPanelClick}>
                  AdminPanel
                </div>
                
              )}
              <div className="dropdown-item" onClick={handleLoginClick}>
                LogIn
              </div>
               <div className="dropdown-item" onClick={handleLogoutClick}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;