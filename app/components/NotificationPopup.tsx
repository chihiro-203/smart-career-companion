// components/NotificationPopup.tsx (or app/components/NotificationPopup.tsx)
"use client"; // Add this if it's in the app directory and uses client-side features like useEffect

import React, { useEffect } from 'react'; // Import useEffect specifically

interface NotificationPopupProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ message, type, onClose }) => {
  // Call useEffect at the top level
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (message) { // Conditional logic inside the effect is fine
      timer = setTimeout(() => {
        onClose();
      }, 5000); // Close after 5 seconds
    }
    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [message, onClose]); // Dependencies for the effect

  // Now, the early return for rendering is fine
  if (!message) {
    return null;
  }

  const baseStyle = "fixed top-5 right-5 p-4 rounded-md shadow-lg text-white flex justify-between items-center z-50"; // Added z-index
  const typeStyles = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold text-lg leading-none hover:text-gray-200">×</button>
    </div>
  );
};

export default NotificationPopup;