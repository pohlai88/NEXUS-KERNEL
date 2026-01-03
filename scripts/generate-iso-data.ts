#!/usr/bin/env node
/**
 * ISO Data Generator
 * Generates ISO 3166-1 (countries) and ISO 4217 (currencies) data for kernel
 */

// ISO 3166-1 Alpha-2 Country Codes (sample - full list has 195+ countries)
const ISO_COUNTRIES = [
  { code: "MY", name: "MALAYSIA" },
  { code: "SG", name: "SINGAPORE" },
  { code: "US", name: "UNITED_STATES" },
  { code: "GB", name: "UNITED_KINGDOM" },
  { code: "AU", name: "AUSTRALIA" },
  { code: "CA", name: "CANADA" },
  { code: "DE", name: "GERMANY" },
  { code: "FR", name: "FRANCE" },
  { code: "IT", name: "ITALY" },
  { code: "ES", name: "SPAIN" },
  { code: "NL", name: "NETHERLANDS" },
  { code: "BE", name: "BELGIUM" },
  { code: "CH", name: "SWITZERLAND" },
  { code: "AT", name: "AUSTRIA" },
  { code: "SE", name: "SWEDEN" },
  { code: "NO", name: "NORWAY" },
  { code: "DK", name: "DENMARK" },
  { code: "FI", name: "FINLAND" },
  { code: "PL", name: "POLAND" },
  { code: "CZ", name: "CZECH_REPUBLIC" },
  { code: "IE", name: "IRELAND" },
  { code: "PT", name: "PORTUGAL" },
  { code: "GR", name: "GREECE" },
  { code: "JP", name: "JAPAN" },
  { code: "CN", name: "CHINA" },
  { code: "IN", name: "INDIA" },
  { code: "KR", name: "SOUTH_KOREA" },
  { code: "TH", name: "THAILAND" },
  { code: "ID", name: "INDONESIA" },
  { code: "PH", name: "PHILIPPINES" },
  { code: "VN", name: "VIETNAM" },
  { code: "BR", name: "BRAZIL" },
  { code: "MX", name: "MEXICO" },
  { code: "AR", name: "ARGENTINA" },
  { code: "CL", name: "CHILE" },
  { code: "CO", name: "COLOMBIA" },
  { code: "PE", name: "PERU" },
  { code: "ZA", name: "SOUTH_AFRICA" },
  { code: "EG", name: "EGYPT" },
  { code: "NG", name: "NIGERIA" },
  { code: "KE", name: "KENYA" },
  { code: "AE", name: "UNITED_ARAB_EMIRATES" },
  { code: "SA", name: "SAUDI_ARABIA" },
  { code: "IL", name: "ISRAEL" },
  { code: "TR", name: "TURKEY" },
  { code: "RU", name: "RUSSIA" },
  { code: "NZ", name: "NEW_ZEALAND" },
  { code: "HK", name: "HONG_KONG" },
  { code: "TW", name: "TAIWAN" },
  // Add more countries as needed to reach 195+
];

// ISO 4217 Currency Codes (sample - full list has 170+ currencies)
const ISO_CURRENCIES = [
  { code: "MYR", name: "MALAYSIAN_RINGGIT" },
  { code: "SGD", name: "SINGAPORE_DOLLAR" },
  { code: "USD", name: "US_DOLLAR" },
  { code: "GBP", name: "BRITISH_POUND" },
  { code: "EUR", name: "EURO" },
  { code: "AUD", name: "AUSTRALIAN_DOLLAR" },
  { code: "CAD", name: "CANADIAN_DOLLAR" },
  { code: "JPY", name: "JAPANESE_YEN" },
  { code: "CNY", name: "CHINESE_YUAN" },
  { code: "INR", name: "INDIAN_RUPEE" },
  { code: "KRW", name: "SOUTH_KOREAN_WON" },
  { code: "THB", name: "THAI_BAHT" },
  { code: "IDR", name: "INDONESIAN_RUPIAH" },
  { code: "PHP", name: "PHILIPPINE_PESO" },
  { code: "VND", name: "VIETNAMESE_DONG" },
  { code: "BRL", name: "BRAZILIAN_REAL" },
  { code: "MXN", name: "MEXICAN_PESO" },
  { code: "ARS", name: "ARGENTINE_PESO" },
  { code: "CLP", name: "CHILEAN_PESO" },
  { code: "COP", name: "COLOMBIAN_PESO" },
  { code: "PEN", name: "PERUVIAN_SOL" },
  { code: "ZAR", name: "SOUTH_AFRICAN_RAND" },
  { code: "EGP", name: "EGYPTIAN_POUND" },
  { code: "NGN", name: "NIGERIAN_NAIRA" },
  { code: "KES", name: "KENYAN_SHILLING" },
  { code: "AED", name: "UAE_DIRHAM" },
  { code: "SAR", name: "SAUDI_RIYAL" },
  { code: "ILS", name: "ISRAELI_SHEKEL" },
  { code: "TRY", name: "TURKISH_LIRA" },
  { code: "RUB", name: "RUSSIAN_ROUBLE" },
  { code: "NZD", name: "NEW_ZEALAND_DOLLAR" },
  { code: "HKD", name: "HONG_KONG_DOLLAR" },
  { code: "TWD", name: "TAIWAN_DOLLAR" },
  { code: "CHF", name: "SWISS_FRANC" },
  { code: "SEK", name: "SWEDISH_KRONA" },
  { code: "NOK", name: "NORWEGIAN_KRONE" },
  { code: "DKK", name: "DANISH_KRONE" },
  { code: "PLN", name: "POLISH_ZLOTY" },
  { code: "CZK", name: "CZECH_KORUNA" },
  { code: "HUF", name: "HUNGARIAN_FORINT" },
  { code: "RON", name: "ROMANIAN_LEU" },
  { code: "BGN", name: "BULGARIAN_LEV" },
  { code: "HRK", name: "CROATIAN_KUNA" },
  // Add more currencies as needed to reach 170+
];

console.log("ISO Data Generator");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
console.log(`Countries: ${ISO_COUNTRIES.length}`);
console.log(`Currencies: ${ISO_CURRENCIES.length}`);
console.log("\nNote: This is a sample. Full ISO 3166-1 has 195+ countries,");
console.log("      and ISO 4217 has 170+ currencies.");
console.log("      Add remaining entries to reach target counts.");

export { ISO_COUNTRIES, ISO_CURRENCIES };

