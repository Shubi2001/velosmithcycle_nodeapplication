/* 
  Velosmith Application Configuration
  This file contains global settings and constants for the Velosmith app.
*/

console.log("Velosmith app.js initialized");

export const APP_CONFIG = {
  name: "Velosmith",
  version: "1.0.0",
  apiEndpoints: {
    inventory: "/api/inventory",
    orders: "/api/orders"
  },
  theme: {
    primary: "#FF4D00",
    background: "#050505",
    accent: "#080808"
  },
  features: {
    enable360Viewer: true,
    enableAiNarrative: true,
    enableCart: true
  }
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};
