// Currency conversion utility

// Define supported currencies and their symbols
export type SupportedCurrencyCode = 'USD' | 'GBP' | 'NGN' | 'EUR';

export const SUPPORTED_CURRENCIES: Record<SupportedCurrencyCode, { name: string; symbol: string }> = {
    USD: { name: "US Dollar", symbol: "$" },
    GBP: { name: "British Pound", symbol: "£" },
    NGN: { name: "Nigerian Naira", symbol: "₦" },
    EUR: { name: "Euro", symbol: "€" },
  }
  
  // Updated fallback rates with accurate SOL pricing
  const FALLBACK_RATES = {
    USD: 1,
    USDC: 1, // Stablecoin pegged to USD
    SOL: 130, // Updated SOL value in USD
    GBP: 0.75,
    NGN: 1605.34,
    EUR: 0.88,
  }
  
  // SOL to NGN direct conversion rate (based on current market)
  const SOL_TO_NGN_RATE = 208334;
  
  /**
   * Fetch current exchange rates from an API
   * Using ExchangeRate-API for this example
   */
  export async function fetchExchangeRates(): Promise<Record<string, number>> {
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/USD")
  
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
  
      const data = await response.json()
  
      if (data.result === "success" && data.rates) {
        // Calculate SOL rate in USD (if we can get it from external API)
        // Otherwise use our fallback
        const solInUsd = FALLBACK_RATES.SOL;
        
        // Get NGN rate to USD
        const ngnToUsd = data.rates.NGN || FALLBACK_RATES.NGN;
        
        // Return rates with USD as base, adding our crypto rates
        return {
          ...data.rates,
          USDC: 1, // Always 1:1 with USD
          SOL: solInUsd, // Use appropriate SOL to USD rate
          // Add direct pair conversion rate
          SOL_NGN: SOL_TO_NGN_RATE,
        }
      } else {
        console.warn("Exchange rate API returned unexpected format:", data)
        return {
          ...FALLBACK_RATES,
          SOL_NGN: SOL_TO_NGN_RATE,
        }
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error)
      return {
        ...FALLBACK_RATES,
        SOL_NGN: SOL_TO_NGN_RATE,
      }
    }
  }
  
  /**
   * Convert an amount from one currency to another
   */
  export async function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ convertedAmount: number; rate: number; success: boolean }> {
    try {
      if (fromCurrency === toCurrency) {
        return { convertedAmount: amount, rate: 1, success: true }
      }
  
      // Special case for SOL to NGN - use direct conversion
      if (fromCurrency === "SOL" && toCurrency === "NGN") {
        const convertedAmount = amount * SOL_TO_NGN_RATE;
        return { convertedAmount, rate: SOL_TO_NGN_RATE, success: true }
      }
      
      // Special case for NGN to SOL - use direct conversion
      if (fromCurrency === "NGN" && toCurrency === "SOL") {
        const rate = 1 / SOL_TO_NGN_RATE;
        const convertedAmount = amount * rate;
        return { convertedAmount, rate, success: true }
      }
  
      // Get current exchange rates (with USD as base)
      const rates = await fetchExchangeRates()
  
      // Special handling for cryptocurrencies
      const fromRate = getCurrencyRate(fromCurrency, rates)
      const toRate = getCurrencyRate(toCurrency, rates)
      
      if (fromRate === null || toRate === null) {
        throw new Error(`Exchange rate not available for ${fromCurrency} or ${toCurrency}`)
      }
  
      // Calculate conversion through USD as the base currency
      // First convert fromCurrency to USD, then USD to toCurrency
      const amountInUSD = fromCurrency === "USD" || fromCurrency === "USDC" 
        ? amount 
        : amount * fromRate
        
      const convertedAmount = toCurrency === "USD" || toCurrency === "USDC"
        ? amountInUSD
        : amountInUSD * toRate
        
      // Calculate effective rate
      const rate = convertedAmount / amount
  
      return { convertedAmount, rate, success: true }
    } catch (error) {
      console.error("Currency conversion error:", error)
      
      // Special case fallback for SOL to NGN
      if (fromCurrency === "SOL" && toCurrency === "NGN") {
        const convertedAmount = amount * SOL_TO_NGN_RATE;
        return { convertedAmount, rate: SOL_TO_NGN_RATE, success: false }
      }
      
      // Use fallback for other cases
      try {
        const fromRate = getCurrencyRate(fromCurrency, FALLBACK_RATES)
        const toRate = getCurrencyRate(toCurrency, FALLBACK_RATES)
        
        if (fromRate === null || toRate === null) {
          return { convertedAmount: amount, rate: 1, success: false }
        }
  
        // Same conversion logic using fallback rates
        const amountInUSD = fromCurrency === "USD" || fromCurrency === "USDC" 
          ? amount 
          : amount * fromRate
          
        const convertedAmount = toCurrency === "USD" || toCurrency === "USDC"
          ? amountInUSD
          : amountInUSD * toRate
          
        return { convertedAmount, rate: convertedAmount / amount, success: false }
      } catch (fallbackError) {
        console.error("Fallback conversion failed:", fallbackError)
        return { convertedAmount: amount, rate: 1, success: false }
      }
    }
  }
  
  /**
   * Get a currency's rate (handling special cases)
   */
  function getCurrencyRate(currency: string, rates: Record<string, number>): number | null {
    // Handle special cases
    if (currency === "USDC") return 1 // USDC is pegged to USD
    if (currency === "USD") return 1 // Base currency
    
    // Direct lookup
    if (rates[currency] !== undefined) return rates[currency]
    
    // For crypto not in standard rates but in our fallbacks
    if (currency === "SOL" && FALLBACK_RATES["SOL"]) {
      return FALLBACK_RATES["SOL"]
    }
    
    return null
  }
  
  /**
  export function formatCurrency(amount: number, currencyCode: string | SupportedCurrencyCode): string {
   */
  export function formatCurrency(amount: number, currencyCode: string | SupportedCurrencyCode): string {
    // Handle crypto currencies
    if (currencyCode === "SOL") {
      return `${amount.toFixed(4)} SOL`
    }
    
    if (currencyCode === "USDC") {
      return `$${amount.toFixed(2)}`
    }
    
    const currency = SUPPORTED_CURRENCIES[currencyCode as SupportedCurrencyCode] || SUPPORTED_CURRENCIES.USD
  
    // Format based on currency
    let formattedAmount
    switch (currencyCode) {
      case "NGN":
        // No decimal places for Naira
        formattedAmount = Math.round(amount).toLocaleString()
        break
      default:
        // 2 decimal places for other currencies
        formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")
    }
  
    return `${currency.symbol}${formattedAmount}`
  }