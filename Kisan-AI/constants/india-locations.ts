export const INDIA_LOCATIONS = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kadapa", "Tirupati", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  Assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Bongaigaon"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Arrah", "Begusarai"],
  Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Durg", "Korba", "Raigarh", "Jagdalpur"],
  Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Anand"],
  Haryana: ["Gurugram", "Faridabad", "Ambala", "Hisar", "Rohtak", "Karnal", "Panipat", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Shimla", "Dharamsala", "Solan", "Mandi", "Kullu", "Hamirpur", "Una"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum", "Davanagere", "Ballari", "Dharwad"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Malappuram"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Latur"],
  Manipur: ["Imphal", "Thoubal", "Churachandpur", "Bishnupur", "Ukhrul"],
  Meghalaya: ["Shillong", "Tura", "Jowai", "Nongstoin"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur", "Sikar"],
  Sikkim: ["Gangtok", "Namchi", "Mangan", "Gyalshing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Tiruppur"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar"],
  Tripura: ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Ghaziabad", "Noida", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur", "Saharanpur", "Mathura", "Firozabad"],
  Uttarakhand: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Rishikesh", "Kashipur"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Darjeeling", "Malda", "Bardhaman"],
  Delhi: ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Dwarka", "Rohini"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Kathua", "Udhampur"],
  Ladakh: ["Leh", "Kargil"],
  Chandigarh: ["Chandigarh"],
  Puducherry: ["Puducherry", "Karaikal", "Yanam", "Mahe"],
  "Andaman and Nicobar": ["Port Blair", "Car Nicobar", "Mayabunder"],
  "Dadra and Nagar Haveli": ["Silvassa", "Amli", "Khadoli"],
  "Daman and Diu": ["Daman", "Diu"],
  Lakshadweep: ["Kavaratti", "Agatti", "Minicoy"],
} as const;

export type IndiaState = keyof typeof INDIA_LOCATIONS;

export const INDIA_STATES = Object.keys(INDIA_LOCATIONS).sort((a, b) =>
  a.localeCompare(b)
) as IndiaState[];

export function getDistrictsByState(state?: string): string[] {
  if (!state || !(state in INDIA_LOCATIONS)) return [];
  return [...INDIA_LOCATIONS[state as IndiaState]];
}
