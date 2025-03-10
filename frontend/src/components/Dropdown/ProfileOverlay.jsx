import React, { useState } from 'react'; 
import { HiOutlineUser, HiOutlineLogout } from 'react-icons/hi';

const ProfileOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Profile Icon */}
      <button onClick={toggleDropdown} className="text-blue-600 hover:text-blue-700 focus:outline-none">
        <HiOutlineUser size={30} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
          <div className="flex flex-col">
            {/* Profile Option */}
            <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
              <HiOutlineUser size={20} className="mr-2" />
              Profile
            </button>
            {/* Logout Option */}
            <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
              <HiOutlineLogout size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOverlay;
