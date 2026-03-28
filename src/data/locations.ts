export interface CityLocation {
  city: string;
  zones: string[];
}

export const locations: CityLocation[] = [
  // Tier 1 Cities
  { city: "Mumbai", zones: ["Andheri West", "Bandra", "Dadar", "Powai", "Navi Mumbai"] },
  { city: "Delhi", zones: ["Karol Bagh", "Dwarka", "Connaught Place", "South Ex", "Rohini"] },
  { city: "Bengaluru", zones: ["Koramangala", "HSR Layout", "Indiranagar", "Whitefield", "Marathahalli"] },
  { city: "Hyderabad", zones: ["Madhapur", "Gachibowli", "Banjara Hills", "Kukatpally", "Jubilee Hills"] },
  { city: "Chennai", zones: ["T. Nagar", "Anna Nagar", "Velachery", "Adyar", "OMR"] },
  { city: "Kolkata", zones: ["Salt Lake", "Park Street", "New Town", "Ballygunge", "Dum Dum"] },
  // Tier 2 Cities
  { city: "Pune", zones: ["Koregaon Park", "Hinjewadi", "Viman Nagar", "Kothrud"] },
  { city: "Ahmedabad", zones: ["Satellite", "Navrangpura", "Vastrapur", "SG Highway"] },
  { city: "Jaipur", zones: ["Malviya Nagar", "Vaishali Nagar", "C-Scheme", "Mansarovar"] },
  { city: "Lucknow", zones: ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar"] },
  { city: "Chandigarh", zones: ["Sector 17", "Sector 35", "Sector 43", "Mohali"] },
  { city: "Kochi", zones: ["Edappally", "Kakkanad", "MG Road", "Palarivattom"] },
  { city: "Indore", zones: ["Vijay Nagar", "Palasia", "Bhawarkuan", "Rau"] },
];
