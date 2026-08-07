import React from 'react';

interface ShopifyLogoProps {
  className?: string;
  size?: number;
}

/**
 * Authentic Circular Shopify Green Bag Logo
 * Matching official Shopify branding and user image asset
 */
export const ShopifyLogo: React.FC<ShopifyLogoProps> = ({ className = "w-6 h-6", size }) => {
  const style = size ? { width: size, height: size } : undefined;
  
  return (
    <svg 
      className={className} 
      style={style} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer subtle circle frame */}
      <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
      <g transform="translate(18, 16) scale(0.64)">
        {/* Darker green back fold & handle outline */}
        <path d="M68.5 25.5C68.5 25.5 64.2 16.8 54.7 16.8C45.2 16.8 38.6 25.5 38.6 25.5" stroke="#4A7729" strokeWidth="6" strokeLinecap="round" />
        {/* Dark fold shadow */}
        <path d="M42.8 25.5L34.2 28.5L25.5 85.5L62.8 94.5L92.8 88.5L84.2 25.5H42.8Z" fill="#4A7729" />
        {/* Main Shopify Lime/Emerald Bag Body (#95BF47 / #7AB55C) */}
        <path d="M42.8 25.5C42.8 25.5 45.5 13.5 35.8 13.5C26 13.5 22.8 25.5 22.8 25.5L7.5 30.5L18.5 90.5L67.5 97.5L84.2 25.5H42.8Z" fill="#95BF47" />
        {/* Inner shadow fold */}
        <path d="M42.8 25.5L22.8 25.5L18.5 90.5L30.5 92.2L42.8 25.5Z" fill="#7AB55C" />
        {/* Crisp White Stylized 'S' Logo */}
        <path d="M52.2 46.2C48.5 44.8 44.8 45.2 44.8 45.2C44.8 45.2 42.5 45.8 42.5 48.2C42.5 50.8 47.8 52.2 51.5 53.8C57.2 56.2 58.8 60.5 58.2 65.8C57.5 72.5 50.2 76.5 42.5 75.2C35.5 74 31.8 69.2 31.8 69.2L34.2 61.8C34.2 61.8 37.8 64.8 41.5 65.5C45.2 66.2 47.8 64.5 48.2 62.5C48.6 60.2 45.2 59.2 40.8 57.2C35.2 54.8 33.5 50.5 34.2 45.2C35.2 38.5 42.8 34.8 51.2 36.2C56.8 37.2 60.2 40.8 60.2 40.8L56.5 47.8C56.5 47.8 54.2 46.8 52.2 46.2Z" fill="#FFFFFF" />
      </g>
    </svg>
  );
};
