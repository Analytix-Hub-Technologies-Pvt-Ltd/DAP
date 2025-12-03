// src/utils/formatNumber.js

export const formatNumber = (num) => {
    let originalValue = num;
    let prefix = '';
    
    if (typeof num === 'string' || num instanceof String) {
      num = num.toString(); // Ensure it's a string
      
      // Don't format percentages
      if(num.endsWith('%')) {
          return originalValue;
      }
  
      // DETECT AND PRESERVE CURRENCY SYMBOL
      const currencyMatch = num.match(/([$₹€£])/);
      if (currencyMatch) {
        prefix = currencyMatch[1];
      }
      
      // Strip currency symbols, commas, and trailing/leading spaces
      const cleanedString = num.replace(/[$,₹€£\s]/g, ''); 
      num = parseFloat(cleanedString);
    }
  
    if (typeof num !== 'number' || isNaN(num)) {
      return originalValue;
    }
  
    // --- UPDATED THRESHOLD TO 10,000 ---
    // Previously < 1000. We changed this to < 10000 so that years (e.g., 2025)
    // are displayed as "2,025" instead of "2.03k".
    if (Math.abs(num) < 10000) {
      return prefix + num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  
    const si = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "K" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" },
    ];
  
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
      if (Math.abs(num) >= si[i].value) {
        break;
      }
    }
    let formattedValue = (num / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
    return prefix + formattedValue;
};