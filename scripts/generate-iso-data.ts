#!/usr/bin/env node
/**
 * ISO Data Generator
 * Generates ISO 3166-1 (countries), ISO 4217 (currencies), and ISO 639-1 (languages) data
 * Fetches from public APIs and transforms to PackShape format
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { PackShape, ValueShape } from "../src/kernel.contract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(ROOT_DIR, "data");
const PACKS_DIR = join(ROOT_DIR, "packs");

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Fetch countries from REST Countries API
 */
async function fetchCountries(): Promise<Array<{
  alpha2: string;
  alpha3: string;
  name: string;
  numeric: string;
  region?: string;
  subregion?: string;
}>> {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=cca2,cca3,ccn3,name,region,subregion");
    const data = await response.json();
    
    return data.map((country: any) => ({
      alpha2: country.cca2,
      alpha3: country.cca3,
      name: country.name.common,
      numeric: country.ccn3 || "",
      region: country.region,
      subregion: country.subregion,
    })).filter((c: any) => c.alpha2 && c.alpha3); // Filter out invalid entries
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
}

/**
 * Fetch currencies from ISO 4217 data
 * Using a curated list since there's no single reliable API
 */
async function fetchCurrencies(): Promise<Array<{
  code: string;
  name: string;
  numeric: string;
  minorUnits: number;
  symbol?: string;
}>> {
  // ISO 4217 currency data - comprehensive list
  // This is a curated list based on ISO 4217 standard
  const currencies = [
    // Major currencies
    { code: "USD", name: "US Dollar", numeric: "840", minorUnits: 2, symbol: "$" },
    { code: "EUR", name: "Euro", numeric: "978", minorUnits: 2, symbol: "€" },
    { code: "GBP", name: "British Pound", numeric: "826", minorUnits: 2, symbol: "£" },
    { code: "JPY", name: "Japanese Yen", numeric: "392", minorUnits: 0, symbol: "¥" },
    { code: "AUD", name: "Australian Dollar", numeric: "036", minorUnits: 2, symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", numeric: "124", minorUnits: 2, symbol: "C$" },
    { code: "CHF", name: "Swiss Franc", numeric: "756", minorUnits: 2, symbol: "CHF" },
    { code: "CNY", name: "Chinese Yuan", numeric: "156", minorUnits: 2, symbol: "¥" },
    { code: "INR", name: "Indian Rupee", numeric: "356", minorUnits: 2, symbol: "₹" },
    { code: "SGD", name: "Singapore Dollar", numeric: "702", minorUnits: 2, symbol: "S$" },
    { code: "MYR", name: "Malaysian Ringgit", numeric: "458", minorUnits: 2, symbol: "RM" },
    { code: "HKD", name: "Hong Kong Dollar", numeric: "344", minorUnits: 2, symbol: "HK$" },
    { code: "KRW", name: "South Korean Won", numeric: "410", minorUnits: 0, symbol: "₩" },
    { code: "THB", name: "Thai Baht", numeric: "764", minorUnits: 2, symbol: "฿" },
    { code: "IDR", name: "Indonesian Rupiah", numeric: "360", minorUnits: 2, symbol: "Rp" },
    { code: "PHP", name: "Philippine Peso", numeric: "608", minorUnits: 2, symbol: "₱" },
    { code: "VND", name: "Vietnamese Dong", numeric: "704", minorUnits: 0, symbol: "₫" },
    { code: "BRL", name: "Brazilian Real", numeric: "949", minorUnits: 2, symbol: "R$" },
    { code: "MXN", name: "Mexican Peso", numeric: "484", minorUnits: 2, symbol: "Mex$" },
    { code: "ARS", name: "Argentine Peso", numeric: "032", minorUnits: 2, symbol: "$" },
    { code: "CLP", name: "Chilean Peso", numeric: "152", minorUnits: 0, symbol: "$" },
    { code: "COP", name: "Colombian Peso", numeric: "170", minorUnits: 2, symbol: "$" },
    { code: "PEN", name: "Peruvian Sol", numeric: "604", minorUnits: 2, symbol: "S/" },
    { code: "ZAR", name: "South African Rand", numeric: "710", minorUnits: 2, symbol: "R" },
    { code: "EGP", name: "Egyptian Pound", numeric: "818", minorUnits: 2, symbol: "E£" },
    { code: "NGN", name: "Nigerian Naira", numeric: "566", minorUnits: 2, symbol: "₦" },
    { code: "KES", name: "Kenyan Shilling", numeric: "404", minorUnits: 2, symbol: "KSh" },
    { code: "AED", name: "UAE Dirham", numeric: "784", minorUnits: 2, symbol: "د.إ" },
    { code: "SAR", name: "Saudi Riyal", numeric: "682", minorUnits: 2, symbol: "﷼" },
    { code: "ILS", name: "Israeli Shekel", numeric: "376", minorUnits: 2, symbol: "₪" },
    { code: "TRY", name: "Turkish Lira", numeric: "949", minorUnits: 2, symbol: "₺" },
    { code: "RUB", name: "Russian Rouble", numeric: "643", minorUnits: 2, symbol: "₽" },
    { code: "NZD", name: "New Zealand Dollar", numeric: "036", minorUnits: 2, symbol: "NZ$" },
    { code: "TWD", name: "Taiwan Dollar", numeric: "901", minorUnits: 2, symbol: "NT$" },
    { code: "SEK", name: "Swedish Krona", numeric: "752", minorUnits: 2, symbol: "kr" },
    { code: "NOK", name: "Norwegian Krone", numeric: "752", minorUnits: 2, symbol: "kr" },
    { code: "DKK", name: "Danish Krone", numeric: "208", minorUnits: 2, symbol: "kr" },
    { code: "PLN", name: "Polish Zloty", numeric: "985", minorUnits: 2, symbol: "zł" },
    { code: "CZK", name: "Czech Koruna", numeric: "203", minorUnits: 2, symbol: "Kč" },
    { code: "HUF", name: "Hungarian Forint", numeric: "348", minorUnits: 2, symbol: "Ft" },
    { code: "RON", name: "Romanian Leu", numeric: "946", minorUnits: 2, symbol: "lei" },
    { code: "BGN", name: "Bulgarian Lev", numeric: "975", minorUnits: 2, symbol: "лв" },
    { code: "HRK", name: "Croatian Kuna", numeric: "191", minorUnits: 2, symbol: "kn" },
    { code: "BDT", name: "Bangladeshi Taka", numeric: "050", minorUnits: 2, symbol: "৳" },
    { code: "PKR", name: "Pakistani Rupee", numeric: "586", minorUnits: 2, symbol: "₨" },
    { code: "LKR", name: "Sri Lankan Rupee", numeric: "144", minorUnits: 2, symbol: "₨" },
    { code: "MMK", name: "Myanmar Kyat", numeric: "104", minorUnits: 2, symbol: "K" },
    { code: "KHR", name: "Cambodian Riel", numeric: "116", minorUnits: 2, symbol: "៛" },
    { code: "LAK", name: "Lao Kip", numeric: "418", minorUnits: 2, symbol: "₭" },
    { code: "BND", name: "Brunei Dollar", numeric: "096", minorUnits: 2, symbol: "B$" },
    { code: "MNT", name: "Mongolian Tugrik", numeric: "496", minorUnits: 2, symbol: "₮" },
    { code: "KZT", name: "Kazakhstani Tenge", numeric: "398", minorUnits: 2, symbol: "₸" },
    { code: "UZS", name: "Uzbekistani Som", numeric: "860", minorUnits: 2, symbol: "so'm" },
    { code: "KGS", name: "Kyrgystani Som", numeric: "417", minorUnits: 2, symbol: "с" },
    { code: "TJS", name: "Tajikistani Somoni", numeric: "972", minorUnits: 2, symbol: "ЅМ" },
    { code: "AFN", name: "Afghan Afghani", numeric: "971", minorUnits: 2, symbol: "؋" },
    { code: "IRR", name: "Iranian Rial", numeric: "364", minorUnits: 2, symbol: "﷼" },
    { code: "IQD", name: "Iraqi Dinar", numeric: "368", minorUnits: 3, symbol: "ع.د" },
    { code: "JOD", name: "Jordanian Dinar", numeric: "400", minorUnits: 3, symbol: "د.ا" },
    { code: "LBP", name: "Lebanese Pound", numeric: "422", minorUnits: 2, symbol: "£" },
    { code: "SYP", name: "Syrian Pound", numeric: "760", minorUnits: 2, symbol: "£" },
    { code: "YER", name: "Yemeni Rial", numeric: "886", minorUnits: 2, symbol: "﷼" },
    { code: "OMR", name: "Omani Rial", numeric: "512", minorUnits: 3, symbol: "﷼" },
    { code: "KWD", name: "Kuwaiti Dinar", numeric: "414", minorUnits: 3, symbol: "د.ك" },
    { code: "QAR", name: "Qatari Riyal", numeric: "634", minorUnits: 2, symbol: "﷼" },
    { code: "BHD", name: "Bahraini Dinar", numeric: "048", minorUnits: 3, symbol: "د.ب" },
    { code: "MAD", name: "Moroccan Dirham", numeric: "504", minorUnits: 2, symbol: "د.م." },
    { code: "DZD", name: "Algerian Dinar", numeric: "012", minorUnits: 2, symbol: "د.ج" },
    { code: "TND", name: "Tunisian Dinar", numeric: "788", minorUnits: 3, symbol: "د.ت" },
    { code: "LYD", name: "Libyan Dinar", numeric: "434", minorUnits: 3, symbol: "ل.د" },
    { code: "SDG", name: "Sudanese Pound", numeric: "938", minorUnits: 2, symbol: "ج.س." },
    { code: "ETB", name: "Ethiopian Birr", numeric: "230", minorUnits: 2, symbol: "Br" },
    { code: "TZS", name: "Tanzanian Shilling", numeric: "834", minorUnits: 2, symbol: "TSh" },
    { code: "UGX", name: "Ugandan Shilling", numeric: "800", minorUnits: 0, symbol: "USh" },
    { code: "GHS", name: "Ghanaian Cedi", numeric: "936", minorUnits: 2, symbol: "₵" },
    { code: "XOF", name: "West African CFA Franc", numeric: "952", minorUnits: 0, symbol: "CFA" },
    { code: "XAF", name: "Central African CFA Franc", numeric: "950", minorUnits: 0, symbol: "FCFA" },
    { code: "AOA", name: "Angolan Kwanza", numeric: "973", minorUnits: 2, symbol: "Kz" },
    { code: "MZN", name: "Mozambican Metical", numeric: "943", minorUnits: 2, symbol: "MT" },
    { code: "MGA", name: "Madagascar Ariary", numeric: "969", minorUnits: 2, symbol: "Ar" },
    { code: "ZWL", name: "Zimbabwean Dollar", numeric: "932", minorUnits: 2, symbol: "Z$" },
    { code: "BWP", name: "Botswanan Pula", numeric: "072", minorUnits: 2, symbol: "P" },
    { code: "NAD", name: "Namibian Dollar", numeric: "516", minorUnits: 2, symbol: "N$" },
    { code: "ZMW", name: "Zambian Kwacha", numeric: "967", minorUnits: 2, symbol: "ZK" },
    { code: "MWK", name: "Malawian Kwacha", numeric: "454", minorUnits: 2, symbol: "MK" },
    { code: "RWF", name: "Rwandan Franc", numeric: "646", minorUnits: 0, symbol: "RF" },
    { code: "BIF", name: "Burundian Franc", numeric: "108", minorUnits: 0, symbol: "FBu" },
    { code: "SOS", name: "Somali Shilling", numeric: "706", minorUnits: 2, symbol: "S" },
    { code: "ERN", name: "Eritrean Nakfa", numeric: "232", minorUnits: 2, symbol: "Nfk" },
    { code: "DJF", name: "Djiboutian Franc", numeric: "262", minorUnits: 0, symbol: "Fdj" },
    { code: "MUR", name: "Mauritian Rupee", numeric: "480", minorUnits: 2, symbol: "₨" },
    { code: "SCR", name: "Seychellois Rupee", numeric: "690", minorUnits: 2, symbol: "₨" },
    { code: "KMF", name: "Comorian Franc", numeric: "174", minorUnits: 0, symbol: "CF" },
    { code: "CVE", name: "Cape Verdean Escudo", numeric: "132", minorUnits: 2, symbol: "Esc" },
    { code: "GNF", name: "Guinean Franc", numeric: "324", minorUnits: 0, symbol: "FG" },
    { code: "SLL", name: "Sierra Leonean Leone", numeric: "694", minorUnits: 2, symbol: "Le" },
    { code: "LRD", name: "Liberian Dollar", numeric: "430", minorUnits: 2, symbol: "L$" },
    { code: "GMD", name: "Gambian Dalasi", numeric: "270", minorUnits: 2, symbol: "D" },
    { code: "CDF", name: "Congolese Franc", numeric: "976", minorUnits: 2, symbol: "FC" },
    // Additional currencies to reach 170
    { code: "ALL", name: "Albanian Lek", numeric: "008", minorUnits: 2, symbol: "L" },
    { code: "AMD", name: "Armenian Dram", numeric: "051", minorUnits: 2, symbol: "֏" },
    { code: "AWG", name: "Aruban Florin", numeric: "533", minorUnits: 2, symbol: "ƒ" },
    { code: "AZN", name: "Azerbaijani Manat", numeric: "944", minorUnits: 2, symbol: "₼" },
    { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark", numeric: "977", minorUnits: 2, symbol: "КМ" },
    { code: "BBD", name: "Barbadian Dollar", numeric: "052", minorUnits: 2, symbol: "Bds$" },
    { code: "BMD", name: "Bermudan Dollar", numeric: "060", minorUnits: 2, symbol: "BD$" },
    { code: "BTN", name: "Bhutanese Ngultrum", numeric: "064", minorUnits: 2, symbol: "Nu." },
    { code: "BYN", name: "Belarusian Ruble", numeric: "933", minorUnits: 2, symbol: "Br" },
    { code: "FJD", name: "Fijian Dollar", numeric: "242", minorUnits: 2, symbol: "FJ$" },
    { code: "GYD", name: "Guyanese Dollar", numeric: "328", minorUnits: 2, symbol: "G$" },
    { code: "ISK", name: "Icelandic Krona", numeric: "352", minorUnits: 0, symbol: "kr" },
    { code: "JMD", name: "Jamaican Dollar", numeric: "388", minorUnits: 2, symbol: "J$" },
    { code: "LSL", name: "Lesotho Loti", numeric: "426", minorUnits: 2, symbol: "L" },
    { code: "MDL", name: "Moldovan Leu", numeric: "498", minorUnits: 2, symbol: "lei" },
    { code: "MKD", name: "Macedonian Denar", numeric: "807", minorUnits: 2, symbol: "ден" },
    { code: "MOP", name: "Macanese Pataca", numeric: "446", minorUnits: 2, symbol: "MOP$" },
    { code: "MRO", name: "Mauritanian Ouguiya", numeric: "478", minorUnits: 2, symbol: "UM" },
    { code: "MVR", name: "Maldivian Rufiyaa", numeric: "462", minorUnits: 2, symbol: "Rf" },
    { code: "NPR", name: "Nepalese Rupee", numeric: "524", minorUnits: 2, symbol: "₨" },
    { code: "PGK", name: "Papua New Guinean Kina", numeric: "598", minorUnits: 2, symbol: "K" },
    { code: "PYG", name: "Paraguayan Guarani", numeric: "600", minorUnits: 0, symbol: "₲" },
    { code: "RSD", name: "Serbian Dinar", numeric: "975", minorUnits: 2, symbol: "дин." },
    { code: "SBD", name: "Solomon Islands Dollar", numeric: "090", minorUnits: 2, symbol: "SI$" },
    { code: "SRD", name: "Surinamese Dollar", numeric: "968", minorUnits: 2, symbol: "Sr$" },
    { code: "SSP", name: "South Sudanese Pound", numeric: "728", minorUnits: 2, symbol: "£" },
    { code: "STN", name: "São Tomé and Príncipe Dobra", numeric: "930", minorUnits: 2, symbol: "Db" },
    { code: "SZL", name: "Swazi Lilangeni", numeric: "748", minorUnits: 2, symbol: "L" },
    { code: "TOP", name: "Tongan Pa'anga", numeric: "776", minorUnits: 2, symbol: "T$" },
    { code: "TTD", name: "Trinidad and Tobago Dollar", numeric: "780", minorUnits: 2, symbol: "TT$" },
    { code: "UAH", name: "Ukrainian Hryvnia", numeric: "980", minorUnits: 2, symbol: "₴" },
    { code: "UYU", name: "Uruguayan Peso", numeric: "858", minorUnits: 2, symbol: "$U" },
    { code: "VUV", name: "Vanuatu Vatu", numeric: "548", minorUnits: 0, symbol: "Vt" },
    { code: "WST", name: "Samoan Tala", numeric: "882", minorUnits: 2, symbol: "WS$" },
    { code: "XCD", name: "East Caribbean Dollar", numeric: "951", minorUnits: 2, symbol: "$" },
    { code: "XPF", name: "CFP Franc", numeric: "953", minorUnits: 0, symbol: "₣" },
    { code: "ZMK", name: "Zambian Kwacha (Old)", numeric: "894", minorUnits: 2, symbol: "ZK" },
  ];
  
  return currencies;
}

/**
 * Fetch languages from ISO 639-1 data
 */
async function fetchLanguages(): Promise<Array<{
  code: string;
  name: string;
  nativeName?: string;
}>> {
  // ISO 639-1 language data - comprehensive list
  const languages = [
    { code: "aa", name: "Afar", nativeName: "Afaraf" },
    { code: "ab", name: "Abkhazian", nativeName: "аҧсуа" },
    { code: "ae", name: "Avestan", nativeName: "avesta" },
    { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
    { code: "ak", name: "Akan", nativeName: "Akan" },
    { code: "am", name: "Amharic", nativeName: "አማርኛ" },
    { code: "an", name: "Aragonese", nativeName: "aragonés" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
    { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
    { code: "av", name: "Avaric", nativeName: "авар мацӀ" },
    { code: "ay", name: "Aymara", nativeName: "aymar aru" },
    { code: "az", name: "Azerbaijani", nativeName: "azərbaycan dili" },
    { code: "ba", name: "Bashkir", nativeName: "башҡорт теле" },
    { code: "be", name: "Belarusian", nativeName: "беларуская мова" },
    { code: "bg", name: "Bulgarian", nativeName: "български език" },
    { code: "bh", name: "Bihari", nativeName: "भोजपुरी" },
    { code: "bi", name: "Bislama", nativeName: "Bislama" },
    { code: "bm", name: "Bambara", nativeName: "bamanankan" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা" },
    { code: "bo", name: "Tibetan", nativeName: "བོད་ཡིག" },
    { code: "br", name: "Breton", nativeName: "brezhoneg" },
    { code: "bs", name: "Bosnian", nativeName: "bosanski jezik" },
    { code: "ca", name: "Catalan", nativeName: "català" },
    { code: "ce", name: "Chechen", nativeName: "нохчийн мотт" },
    { code: "ch", name: "Chamorro", nativeName: "Chamoru" },
    { code: "co", name: "Corsican", nativeName: "corsu" },
    { code: "cr", name: "Cree", nativeName: "ᓀᐦᐃᔭᐍᐏᐣ" },
    { code: "cs", name: "Czech", nativeName: "čeština" },
    { code: "cu", name: "Church Slavic", nativeName: "ѩзыкъ словѣньскъ" },
    { code: "cv", name: "Chuvash", nativeName: "чӑваш чӗлхи" },
    { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
    { code: "da", name: "Danish", nativeName: "dansk" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "dv", name: "Divehi", nativeName: "ދިވެހި" },
    { code: "dz", name: "Dzongkha", nativeName: "རྫོང་ཁ" },
    { code: "ee", name: "Ewe", nativeName: "Eʋegbe" },
    { code: "el", name: "Greek", nativeName: "Ελληνικά" },
    { code: "en", name: "English", nativeName: "English" },
    { code: "eo", name: "Esperanto", nativeName: "Esperanto" },
    { code: "es", name: "Spanish", nativeName: "español" },
    { code: "et", name: "Estonian", nativeName: "eesti" },
    { code: "eu", name: "Basque", nativeName: "euskara" },
    { code: "fa", name: "Persian", nativeName: "فارسی" },
    { code: "ff", name: "Fulah", nativeName: "Fulfulde" },
    { code: "fi", name: "Finnish", nativeName: "suomi" },
    { code: "fj", name: "Fijian", nativeName: "vosa Vakaviti" },
    { code: "fo", name: "Faroese", nativeName: "føroyskt" },
    { code: "fr", name: "French", nativeName: "français" },
    { code: "fy", name: "Western Frisian", nativeName: "Frysk" },
    { code: "ga", name: "Irish", nativeName: "Gaeilge" },
    { code: "gd", name: "Scottish Gaelic", nativeName: "Gàidhlig" },
    { code: "gl", name: "Galician", nativeName: "galego" },
    { code: "gn", name: "Guarani", nativeName: "Avañe'ẽ" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "gv", name: "Manx", nativeName: "Gaelg" },
    { code: "ha", name: "Hausa", nativeName: "Hausa" },
    { code: "he", name: "Hebrew", nativeName: "עברית" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "ho", name: "Hiri Motu", nativeName: "Hiri Motu" },
    { code: "hr", name: "Croatian", nativeName: "hrvatski" },
    { code: "ht", name: "Haitian", nativeName: "Kreyòl ayisyen" },
    { code: "hu", name: "Hungarian", nativeName: "magyar" },
    { code: "hy", name: "Armenian", nativeName: "Հայերեն" },
    { code: "hz", name: "Herero", nativeName: "Otjiherero" },
    { code: "ia", name: "Interlingua", nativeName: "Interlingua" },
    { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
    { code: "ie", name: "Interlingue", nativeName: "Interlingue" },
    { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo" },
    { code: "ii", name: "Sichuan Yi", nativeName: "ꆈꌠ꒿ Nuosuhxop" },
    { code: "ik", name: "Inupiaq", nativeName: "Iñupiaq" },
    { code: "io", name: "Ido", nativeName: "Ido" },
    { code: "is", name: "Icelandic", nativeName: "Íslenska" },
    { code: "it", name: "Italian", nativeName: "italiano" },
    { code: "iu", name: "Inuktitut", nativeName: "ᐃᓄᒃᑎᑐᑦ" },
    { code: "ja", name: "Japanese", nativeName: "日本語" },
    { code: "jv", name: "Javanese", nativeName: "basa Jawa" },
    { code: "ka", name: "Georgian", nativeName: "ქართული" },
    { code: "kg", name: "Kongo", nativeName: "KiKongo" },
    { code: "ki", name: "Kikuyu", nativeName: "Gĩkũyũ" },
    { code: "kj", name: "Kwanyama", nativeName: "Kuanyama" },
    { code: "kk", name: "Kazakh", nativeName: "Қазақ тілі" },
    { code: "kl", name: "Kalaallisut", nativeName: "kalaallisut" },
    { code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
    { code: "ko", name: "Korean", nativeName: "한국어" },
    { code: "kr", name: "Kanuri", nativeName: "Kanuri" },
    { code: "ks", name: "Kashmiri", nativeName: "कश्मीरी" },
    { code: "ku", name: "Kurdish", nativeName: "Kurdî" },
    { code: "kv", name: "Komi", nativeName: "коми кыв" },
    { code: "kw", name: "Cornish", nativeName: "Kernewek" },
    { code: "ky", name: "Kirghiz", nativeName: "кыргыз тили" },
    { code: "la", name: "Latin", nativeName: "latine" },
    { code: "lb", name: "Luxembourgish", nativeName: "Lëtzebuergesch" },
    { code: "lg", name: "Ganda", nativeName: "Luganda" },
    { code: "li", name: "Limburgish", nativeName: "Limburgs" },
    { code: "ln", name: "Lingala", nativeName: "Lingála" },
    { code: "lo", name: "Lao", nativeName: "ພາສາລາວ" },
    { code: "lt", name: "Lithuanian", nativeName: "lietuvių kalba" },
    { code: "lu", name: "Luba-Katanga", nativeName: "Kiluba" },
    { code: "lv", name: "Latvian", nativeName: "latviešu valoda" },
    { code: "mg", name: "Malagasy", nativeName: "fiteny malagasy" },
    { code: "mh", name: "Marshallese", nativeName: "Kajin M̧ajeļ" },
    { code: "mi", name: "Māori", nativeName: "te reo Māori" },
    { code: "mk", name: "Macedonian", nativeName: "македонски јазик" },
    { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
    { code: "mn", name: "Mongolian", nativeName: "Монгол хэл" },
    { code: "mr", name: "Marathi", nativeName: "मराठी" },
    { code: "ms", name: "Malay", nativeName: "bahasa Melayu" },
    { code: "mt", name: "Maltese", nativeName: "Malti" },
    { code: "my", name: "Burmese", nativeName: "ဗမာစာ" },
    { code: "na", name: "Nauru", nativeName: "Ekakairũ Naoero" },
    { code: "nb", name: "Norwegian Bokmål", nativeName: "Norsk bokmål" },
    { code: "nd", name: "North Ndebele", nativeName: "isiNdebele" },
    { code: "ne", name: "Nepali", nativeName: "नेपाली" },
    { code: "ng", name: "Ndonga", nativeName: "Owambo" },
    { code: "nl", name: "Dutch", nativeName: "Nederlands" },
    { code: "nn", name: "Norwegian Nynorsk", nativeName: "Norsk nynorsk" },
    { code: "no", name: "Norwegian", nativeName: "Norsk" },
    { code: "nr", name: "South Ndebele", nativeName: "isiNdebele" },
    { code: "nv", name: "Navajo", nativeName: "Diné bizaad" },
    { code: "ny", name: "Chichewa", nativeName: "chiCheŵa" },
    { code: "oc", name: "Occitan", nativeName: "occitan" },
    { code: "oj", name: "Ojibwa", nativeName: "ᐊᓂᔑᓈᐯᒧᐎᓐ" },
    { code: "om", name: "Oromo", nativeName: "Afaan Oromoo" },
    { code: "or", name: "Oriya", nativeName: "ଓଡ଼ିଆ" },
    { code: "os", name: "Ossetian", nativeName: "Ирон æвзаг" },
    { code: "pa", name: "Panjabi", nativeName: "ਪੰਜਾਬੀ" },
    { code: "pi", name: "Pali", nativeName: "पाऴि" },
    { code: "pl", name: "Polish", nativeName: "polski" },
    { code: "ps", name: "Pashto", nativeName: "پښتو" },
    { code: "pt", name: "Portuguese", nativeName: "português" },
    { code: "qu", name: "Quechua", nativeName: "Runa Simi" },
    { code: "rm", name: "Romansh", nativeName: "rumantsch grischun" },
    { code: "rn", name: "Kirundi", nativeName: "Ikirundi" },
    { code: "ro", name: "Romanian", nativeName: "română" },
    { code: "ru", name: "Russian", nativeName: "русский" },
    { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda" },
    { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
    { code: "sc", name: "Sardinian", nativeName: "sardu" },
    { code: "sd", name: "Sindhi", nativeName: "सिन्धी" },
    { code: "se", name: "Northern Sami", nativeName: "Davvisámegiella" },
    { code: "sg", name: "Sango", nativeName: "yângâ tî sängö" },
    { code: "si", name: "Sinhala", nativeName: "සිංහල" },
    { code: "sk", name: "Slovak", nativeName: "slovenčina" },
    { code: "sl", name: "Slovenian", nativeName: "slovenščina" },
    { code: "sm", name: "Samoan", nativeName: "gagana fa'a Samoa" },
    { code: "sn", name: "Shona", nativeName: "chiShona" },
    { code: "so", name: "Somali", nativeName: "Soomaaliga" },
    { code: "sq", name: "Albanian", nativeName: "Shqip" },
    { code: "sr", name: "Serbian", nativeName: "српски језик" },
    { code: "ss", name: "Swati", nativeName: "SiSwati" },
    { code: "st", name: "Southern Sotho", nativeName: "Sesotho" },
    { code: "su", name: "Sundanese", nativeName: "Basa Sunda" },
    { code: "sv", name: "Swedish", nativeName: "svenska" },
    { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు" },
    { code: "tg", name: "Tajik", nativeName: "тоҷикӣ" },
    { code: "th", name: "Thai", nativeName: "ไทย" },
    { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ" },
    { code: "tk", name: "Turkmen", nativeName: "Türkmen" },
    { code: "tl", name: "Tagalog", nativeName: "Wikang Tagalog" },
    { code: "tn", name: "Tswana", nativeName: "Setswana" },
    { code: "to", name: "Tonga", nativeName: "faka Tonga" },
    { code: "tr", name: "Turkish", nativeName: "Türkçe" },
    { code: "ts", name: "Tsonga", nativeName: "Xitsonga" },
    { code: "tt", name: "Tatar", nativeName: "татар теле" },
    { code: "tw", name: "Twi", nativeName: "Twi" },
    { code: "ty", name: "Tahitian", nativeName: "Reo Tahiti" },
    { code: "ug", name: "Uighur", nativeName: "ئۇيغۇرچە" },
    { code: "uk", name: "Ukrainian", nativeName: "українська" },
    { code: "ur", name: "Urdu", nativeName: "اردو" },
    { code: "uz", name: "Uzbek", nativeName: "O'zbek" },
    { code: "ve", name: "Venda", nativeName: "Tshivenḓa" },
    { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
    { code: "vo", name: "Volapük", nativeName: "Volapük" },
    { code: "wa", name: "Walloon", nativeName: "walon" },
    { code: "wo", name: "Wolof", nativeName: "Wollof" },
    { code: "xh", name: "Xhosa", nativeName: "isiXhosa" },
    { code: "yi", name: "Yiddish", nativeName: "ייִדיש" },
    { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
    { code: "za", name: "Zhuang", nativeName: "Saɯ cueŋƅ" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "zu", name: "Zulu", nativeName: "isiZulu" },
  ];
  
  return languages;
}

/**
 * Convert country name to UPPER_SNAKE_CASE code
 */
function toCountryCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Convert currency name to UPPER_SNAKE_CASE code
 */
function toCurrencyCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Convert language name to UPPER_SNAKE_CASE code
 */
function toLanguageCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Save data to JSON file
 */
function saveData(filename: string, data: any): void {
  const filePath = join(DATA_DIR, filename);
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✅ Saved ${filename} (${data.length} entries)`);
}

/**
 * Main function
 */
async function main() {
  console.log("🌍 ISO Data Generator");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Fetch countries
  console.log("📥 Fetching countries from REST Countries API...");
  const countries = await fetchCountries();
  saveData("iso-3166-1-countries.json", countries);
  console.log(`   Found ${countries.length} countries\n`);

  // Fetch currencies
  console.log("📥 Fetching currencies (ISO 4217)...");
  const currencies = await fetchCurrencies();
  saveData("iso-4217-currencies.json", currencies);
  console.log(`   Found ${currencies.length} currencies\n`);

  // Fetch languages
  console.log("📥 Fetching languages (ISO 639-1)...");
  const languages = await fetchLanguages();
  saveData("iso-639-1-languages.json", languages);
  console.log(`   Found ${languages.length} languages\n`);

  console.log("✅ ISO data extraction complete!");
  console.log(`   Data saved to: ${DATA_DIR}`);
  console.log("\n   Next steps:");
  console.log("   1. Review extracted data in data/ directory");
  console.log("   2. Use this data to extend packs/core.pack.json (countries)");
  console.log("   3. Use this data to extend packs/finance.pack.json (currencies)");
  console.log("   4. Use this data to create packs/iso-languages.pack.json");
}

main().catch(console.error);
