export interface TransitLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  areaType: string;
}

export interface TransitEdge {
  id: string;
  from: string;
  to: string;
  mode: 'BUS' | 'TRAIN' | 'METRO' | 'AUTO';
  distanceKm: number;
  durationMins: number;
  fareInr: number;
  routeName: string;
  frequency: string;
  trafficLevel: 'Low' | 'Moderate' | 'Heavy';
  stops: string[];
}

export const CHENNAI_LOCATIONS: TransitLocation[] = [
  { id: 'loc-central', name: 'Chennai Central', latitude: 13.0827, longitude: 80.2755, areaType: 'Major Transit Hub' },
  { id: 'loc-egmore', name: 'Egmore', latitude: 13.0784, longitude: 80.2616, areaType: 'Transit Hub' },
  { id: 'loc-annanagar', name: 'Anna Nagar', latitude: 13.0850, longitude: 80.2101, areaType: 'Residential & Commercial' },
  { id: 'loc-tnagar', name: 'T. Nagar', latitude: 13.0418, longitude: 80.2341, areaType: 'Commercial Hub' },
  { id: 'loc-adyar', name: 'Adyar', latitude: 13.0012, longitude: 80.2565, areaType: 'Residential Hub' },
  { id: 'loc-guindy', name: 'Guindy', latitude: 13.0067, longitude: 80.2025, areaType: 'Industrial & Transit Hub' },
  { id: 'loc-tambaram', name: 'Tambaram', latitude: 12.9249, longitude: 80.1000, areaType: 'Southern Gateway Transit Hub' },
  { id: 'loc-velachery', name: 'Velachery', latitude: 12.9790, longitude: 80.2185, areaType: 'IT & Residential Hub' },
  { id: 'loc-koyambedu', name: 'Koyambedu', latitude: 13.0732, longitude: 80.1983, areaType: 'Bus Terminus (CMBT)' },
  { id: 'loc-porur', name: 'Porur', latitude: 13.0382, longitude: 80.1565, areaType: 'IT & Commercial Hub' },
  { id: 'loc-chromepet', name: 'Chromepet', latitude: 12.9516, longitude: 80.1408, areaType: 'Residential & Commercial' },
  { id: 'loc-perambur', name: 'Perambur', latitude: 13.1075, longitude: 80.2444, areaType: 'Northern Transit Hub' },
  { id: 'loc-sholinganallur', name: 'Sholinganallur', latitude: 12.8996, longitude: 80.2279, areaType: 'OMR IT Corridor Hub' },
  { id: 'loc-ambattur', name: 'Ambattur', latitude: 13.1143, longitude: 80.1548, areaType: 'Industrial Hub' },
  { id: 'loc-mylapore', name: 'Mylapore', latitude: 13.0338, longitude: 80.2676, areaType: 'Cultural & Heritage Hub' },
  { id: 'loc-nungambakkam', name: 'Nungambakkam', latitude: 13.0569, longitude: 80.2425, areaType: 'Central Commercial' },
  { id: 'loc-saidapet', name: 'Saidapet', latitude: 13.0213, longitude: 80.2231, areaType: 'Transit & Commercial' },
  { id: 'loc-thiruvanmiyur', name: 'Thiruvanmiyur', latitude: 12.9830, longitude: 80.2594, areaType: 'Coastal & IT Gateway' },
  { id: 'loc-airport', name: 'Chennai Airport', latitude: 12.9941, longitude: 80.1709, areaType: 'International Airport' },
  { id: 'loc-marinabeach', name: 'Marina Beach', latitude: 13.0500, longitude: 80.2824, areaType: 'Coastal & Promenade' },
  { id: 'loc-vadapalani', name: 'Vadapalani', latitude: 13.0500, longitude: 80.2121, areaType: 'Commercial & Cinema Hub' },
  { id: 'loc-ashoknagar', name: 'Ashok Nagar', latitude: 13.0354, longitude: 80.2115, areaType: 'Residential & Metro Hub' },
  { id: 'loc-alandur', name: 'Alandur', latitude: 13.0040, longitude: 80.2014, areaType: 'Metro Interchange Hub' },
  { id: 'loc-washermanpet', name: 'Washermanpet', latitude: 13.1107, longitude: 80.2818, areaType: 'North Chennai Gateway' },
  { id: 'loc-nehru-park', name: 'Nehru Park', latitude: 13.0796, longitude: 80.2497, areaType: 'Metro Station' },
  { id: 'loc-kilpauk', name: 'Kilpauk', latitude: 13.0787, longitude: 80.2428, areaType: 'Metro Station' },
  { id: 'loc-pachaiyappas-college', name: "Pachaiyappa's College", latitude: 13.0756, longitude: 80.2328, areaType: 'Metro Station' },
  { id: 'loc-shenoy-nagar', name: 'Shenoy Nagar', latitude: 13.0788, longitude: 80.2251, areaType: 'Metro Station' },
  { id: 'loc-anna-nagar-east', name: 'Anna Nagar East', latitude: 13.0851, longitude: 80.2179, areaType: 'Metro Station' },
  { id: 'loc-anna-nagar-tower', name: 'Anna Nagar Tower', latitude: 13.0847, longitude: 80.2087, areaType: 'Metro Station' },
  { id: 'loc-thirumangalam', name: 'Thirumangalam', latitude: 13.0853, longitude: 80.2016, areaType: 'Metro Station' },
  { id: 'loc-cmbt-metro', name: 'CMBT Metro', latitude: 13.0686, longitude: 80.2037, areaType: 'Metro & Bus Interchange' },
  { id: 'loc-arumbakkam', name: 'Arumbakkam', latitude: 13.0624, longitude: 80.2115, areaType: 'Metro Station' },
  { id: 'loc-ekkattuthangal', name: 'Ekkattuthangal', latitude: 13.0170, longitude: 80.2054, areaType: 'Metro Station' },
  { id: 'loc-st-thomas-mount', name: 'St. Thomas Mount', latitude: 12.9951, longitude: 80.1987, areaType: 'Metro & Railway Interchange' },
  { id: 'loc-wimco-nagar-depot', name: 'Wimco Nagar Depot', latitude: 13.1840, longitude: 80.3090, areaType: 'Metro Depot Station' },
  { id: 'loc-wimco-nagar', name: 'Wimco Nagar', latitude: 13.1792, longitude: 80.3072, areaType: 'Metro Station' },
  { id: 'loc-tiruvottriyur', name: 'Tiruvottriyur', latitude: 13.1596, longitude: 80.3011, areaType: 'North Chennai Metro Station' },
  { id: 'loc-tiruvottriyur-theradi', name: 'Tiruvottriyur Theradi', latitude: 13.1510, longitude: 80.2977, areaType: 'Metro Station' },
  { id: 'loc-kaladipet', name: 'Kaladipet', latitude: 13.1434, longitude: 80.2963, areaType: 'Metro Station' },
  { id: 'loc-tollgate', name: 'Tollgate', latitude: 13.1370, longitude: 80.2920, areaType: 'Metro Station' },
  { id: 'loc-new-washermenpet', name: 'New Washermenpet', latitude: 13.1305, longitude: 80.2891, areaType: 'Metro Station' },
  { id: 'loc-tondiarpet', name: 'Tondiarpet', latitude: 13.1244, longitude: 80.2888, areaType: 'Metro Station' },
  { id: 'loc-sir-theagaraya-college', name: 'Sir Theagaraya College', latitude: 13.1161, longitude: 80.2855, areaType: 'Metro Station' },
  { id: 'loc-mannadi', name: 'Mannadi', latitude: 13.0957, longitude: 80.2860, areaType: 'Metro Station' },
  { id: 'loc-high-court', name: 'High Court', latitude: 13.0879, longitude: 80.2850, areaType: 'Metro Station' },
  { id: 'loc-government-estate', name: 'Government Estate', latitude: 13.0696, longitude: 80.2729, areaType: 'Metro Station' },
  { id: 'loc-lic', name: 'LIC', latitude: 13.0648, longitude: 80.2668, areaType: 'Metro Station' },
  { id: 'loc-thousand-lights', name: 'Thousand Lights', latitude: 13.0603, longitude: 80.2584, areaType: 'Metro Station' },
  { id: 'loc-ag-dms', name: 'AG-DMS', latitude: 13.0450, longitude: 80.2489, areaType: 'Metro Station' },
  { id: 'loc-teynampet', name: 'Teynampet', latitude: 13.0379, longitude: 80.2470, areaType: 'Metro Station' },
  { id: 'loc-nandanam', name: 'Nandanam', latitude: 13.0316, longitude: 80.2417, areaType: 'Metro Station' },
  { id: 'loc-little-mount', name: 'Little Mount', latitude: 13.0147, longitude: 80.2247, areaType: 'Metro Station' },
  { id: 'loc-nanganallur-road', name: 'Nanganallur Road', latitude: 12.9999, longitude: 80.1945, areaType: 'Metro Station' },
  { id: 'loc-meenambakkam-metro', name: 'Meenambakkam', latitude: 12.9877, longitude: 80.1765, areaType: 'Metro Station' },
];

/**
 * Predefined multimodal Chennai transit network edges
 */
export const TRANSIT_EDGES: TransitEdge[] = [
  // ===================== METRO LINES =====================
  // Metro Green Line: Chennai Central <-> St. Thomas Mount
  createEdge('Metro Green Line', 'Chennai Central', 'Egmore', 'METRO', 2.1, 4, 10, 'Every 5 mins', ['Chennai Central', 'Egmore']),
  createEdge('Metro Green Line', 'Egmore', 'Nehru Park', 'METRO', 1.4, 3, 10, 'Every 5 mins', ['Egmore', 'Nehru Park']),
  createEdge('Metro Green Line', 'Nehru Park', 'Kilpauk', 'METRO', 1.1, 2, 10, 'Every 5 mins', ['Nehru Park', 'Kilpauk']),
  createEdge('Metro Green Line', 'Kilpauk', "Pachaiyappa's College", 'METRO', 1.3, 3, 10, 'Every 5 mins', ['Kilpauk', "Pachaiyappa's College"]),
  createEdge('Metro Green Line', "Pachaiyappa's College", 'Shenoy Nagar', 'METRO', 1.4, 3, 10, 'Every 5 mins', ["Pachaiyappa's College", 'Shenoy Nagar']),
  createEdge('Metro Green Line', 'Shenoy Nagar', 'Anna Nagar East', 'METRO', 1.2, 3, 10, 'Every 5 mins', ['Shenoy Nagar', 'Anna Nagar East']),
  createEdge('Metro Green Line', 'Anna Nagar East', 'Anna Nagar Tower', 'METRO', 1.1, 2, 10, 'Every 5 mins', ['Anna Nagar East', 'Anna Nagar Tower']),
  createEdge('Metro Green Line', 'Anna Nagar Tower', 'Thirumangalam', 'METRO', 1.4, 3, 10, 'Every 5 mins', ['Anna Nagar Tower', 'Thirumangalam']),
  createEdge('Metro Green Line', 'Thirumangalam', 'Koyambedu', 'METRO', 2.3, 4, 10, 'Every 5 mins', ['Thirumangalam', 'Koyambedu']),
  createEdge('Metro Green Line', 'Koyambedu', 'CMBT Metro', 'METRO', 1.2, 3, 10, 'Every 5 mins', ['Koyambedu', 'CMBT Metro']),
  createEdge('Metro Green Line', 'CMBT Metro', 'Arumbakkam', 'METRO', 1.5, 3, 10, 'Every 5 mins', ['CMBT Metro', 'Arumbakkam']),
  createEdge('Metro Green Line', 'Arumbakkam', 'Vadapalani', 'METRO', 1.8, 4, 10, 'Every 5 mins', ['Arumbakkam', 'Vadapalani']),
  createEdge('Metro Green Line', 'Vadapalani', 'Ashok Nagar', 'METRO', 1.8, 3, 10, 'Every 5 mins', ['Vadapalani', 'Ashok Nagar']),
  createEdge('Metro Green Line', 'Ashok Nagar', 'Ekkattuthangal', 'METRO', 2.2, 4, 10, 'Every 5 mins', ['Ashok Nagar', 'Ekkattuthangal']),
  createEdge('Metro Green Line', 'Ekkattuthangal', 'Alandur', 'METRO', 1.5, 3, 10, 'Every 5 mins', ['Ekkattuthangal', 'Alandur']),
  createEdge('Metro Green Line', 'Alandur', 'St. Thomas Mount', 'METRO', 1.6, 3, 10, 'Every 5 mins', ['Alandur', 'St. Thomas Mount']),

  // Metro Blue Line: Wimco Nagar Depot <-> Chennai Airport
  createEdge('Metro Blue Line', 'Wimco Nagar Depot', 'Wimco Nagar', 'METRO', 0.5, 2, 3, 'Every 5 mins', ['Wimco Nagar Depot', 'Wimco Nagar']),
  createEdge('Metro Blue Line', 'Wimco Nagar', 'Tiruvottriyur', 'METRO', 2.6, 3, 3, 'Every 5 mins', ['Wimco Nagar', 'Tiruvottriyur']),
  createEdge('Metro Blue Line', 'Tiruvottriyur', 'Tiruvottriyur Theradi', 'METRO', 1.1, 2, 3, 'Every 5 mins', ['Tiruvottriyur', 'Tiruvottriyur Theradi']),
  createEdge('Metro Blue Line', 'Tiruvottriyur Theradi', 'Kaladipet', 'METRO', 1.3, 2, 3, 'Every 5 mins', ['Tiruvottriyur Theradi', 'Kaladipet']),
  createEdge('Metro Blue Line', 'Kaladipet', 'Tollgate', 'METRO', 1.0, 2, 3, 'Every 5 mins', ['Kaladipet', 'Tollgate']),
  createEdge('Metro Blue Line', 'Tollgate', 'New Washermenpet', 'METRO', 1.4, 2, 3, 'Every 5 mins', ['Tollgate', 'New Washermenpet']),
  createEdge('Metro Blue Line', 'New Washermenpet', 'Tondiarpet', 'METRO', 1.2, 2, 3, 'Every 5 mins', ['New Washermenpet', 'Tondiarpet']),
  createEdge('Metro Blue Line', 'Tondiarpet', 'Sir Theagaraya College', 'METRO', 1.0, 2, 3, 'Every 5 mins', ['Tondiarpet', 'Sir Theagaraya College']),
  createEdge('Metro Blue Line', 'Sir Theagaraya College', 'Washermanpet', 'METRO', 1.1, 2, 3, 'Every 5 mins', ['Sir Theagaraya College', 'Washermanpet']),
  createEdge('Metro Blue Line', 'Washermanpet', 'Mannadi', 'METRO', 1.3, 2, 3, 'Every 5 mins', ['Washermanpet', 'Mannadi']),
  createEdge('Metro Blue Line', 'Mannadi', 'High Court', 'METRO', 1.1, 2, 3, 'Every 5 mins', ['Mannadi', 'High Court']),
  createEdge('Metro Blue Line', 'High Court', 'Chennai Central', 'METRO', 1.6, 3, 3, 'Every 5 mins', ['High Court', 'Chennai Central']),
  createEdge('Metro Blue Line', 'Chennai Central', 'Government Estate', 'METRO', 1.4, 3, 3, 'Every 5 mins', ['Chennai Central', 'Government Estate']),
  createEdge('Metro Blue Line', 'Government Estate', 'LIC', 'METRO', 1.1, 2, 3, 'Every 5 mins', ['Government Estate', 'LIC']),
  createEdge('Metro Blue Line', 'LIC', 'Thousand Lights', 'METRO', 1.3, 2, 3, 'Every 5 mins', ['LIC', 'Thousand Lights']),
  createEdge('Metro Blue Line', 'Thousand Lights', 'AG-DMS', 'METRO', 1.6, 3, 3, 'Every 5 mins', ['Thousand Lights', 'AG-DMS']),
  createEdge('Metro Blue Line', 'AG-DMS', 'Teynampet', 'METRO', 1.1, 2, 3, 'Every 5 mins', ['AG-DMS', 'Teynampet']),
  createEdge('Metro Blue Line', 'Teynampet', 'Nandanam', 'METRO', 1.2, 2, 3, 'Every 5 mins', ['Teynampet', 'Nandanam']),
  createEdge('Metro Blue Line', 'Nandanam', 'Saidapet', 'METRO', 1.4, 3, 3, 'Every 5 mins', ['Nandanam', 'Saidapet']),
  createEdge('Metro Blue Line', 'Saidapet', 'Little Mount', 'METRO', 1.1, 2, 3, 'Every 5 mins', ['Saidapet', 'Little Mount']),
  createEdge('Metro Blue Line', 'Little Mount', 'Guindy', 'METRO', 1.3, 3, 3, 'Every 5 mins', ['Little Mount', 'Guindy']),
  createEdge('Metro Blue Line', 'Guindy', 'Alandur', 'METRO', 1.5, 3, 3, 'Every 5 mins', ['Guindy', 'Alandur']),
  createEdge('Metro Blue Line', 'Alandur', 'Nanganallur Road', 'METRO', 1.4, 3, 3, 'Every 5 mins', ['Alandur', 'Nanganallur Road']),
  createEdge('Metro Blue Line', 'Nanganallur Road', 'Meenambakkam', 'METRO', 1.8, 3, 3, 'Every 5 mins', ['Nanganallur Road', 'Meenambakkam']),
  createEdge('Metro Blue Line', 'Meenambakkam', 'Chennai Airport', 'METRO', 2.4, 4, 3, 'Every 5 mins', ['Meenambakkam', 'Chennai Airport']),

  // ===================== SUBURBAN TRAIN LINES =====================
  // South Suburban Line: Central/Beach <-> Egmore <-> Nungambakkam <-> T. Nagar <-> Saidapet <-> Guindy <-> Airport <-> Chromepet <-> Tambaram
  createEdge('South Suburban EMU', 'Chennai Central', 'Egmore', 'TRAIN', 2.2, 5, 5, 'Every 10 mins', ['Chennai Central/Park', 'Egmore']),
  createEdge('South Suburban EMU', 'Egmore', 'Nungambakkam', 'TRAIN', 3.2, 6, 5, 'Every 10 mins', ['Egmore', 'Chetpet', 'Nungambakkam']),
  createEdge('South Suburban EMU', 'Nungambakkam', 'T. Nagar', 'TRAIN', 2.5, 5, 5, 'Every 10 mins', ['Nungambakkam', 'Kodambakkam', 'Mambalam (T. Nagar)']),
  createEdge('South Suburban EMU', 'T. Nagar', 'Saidapet', 'TRAIN', 2.1, 4, 5, 'Every 10 mins', ['Mambalam (T. Nagar)', 'Saidapet']),
  createEdge('South Suburban EMU', 'Saidapet', 'Guindy', 'TRAIN', 2.6, 5, 5, 'Every 10 mins', ['Saidapet', 'Guindy']),
  createEdge('South Suburban EMU', 'Guindy', 'Chennai Airport', 'TRAIN', 4.8, 8, 5, 'Every 10 mins', ['Guindy', 'St. Thomas Mount', 'Tirusulam (Airport)']),
  createEdge('South Suburban EMU', 'Chennai Airport', 'Chromepet', 'TRAIN', 4.6, 7, 5, 'Every 10 mins', ['Tirusulam (Airport)', 'Pallavaram', 'Chromepet']),
  createEdge('South Suburban EMU', 'Chromepet', 'Tambaram', 'TRAIN', 5.2, 9, 5, 'Every 10 mins', ['Chromepet', 'Tambaram Sanatorium', 'Tambaram']),

  // West Suburban Line: Central <-> Perambur <-> Ambattur
  createEdge('West Suburban EMU', 'Chennai Central', 'Perambur', 'TRAIN', 4.9, 10, 5, 'Every 12 mins', ['Chennai Central', 'Basin Bridge', 'Perambur']),
  createEdge('West Suburban EMU', 'Perambur', 'Ambattur', 'TRAIN', 9.5, 16, 10, 'Every 12 mins', ['Perambur', 'Villivakkam', 'Korattur', 'Pattaravakkam', 'Ambattur']),

  // MRTS Line: Central/Beach <-> Marina Beach <-> Mylapore <-> Adyar <-> Thiruvanmiyur <-> Velachery
  createEdge('MRTS Railway Line', 'Chennai Central', 'Marina Beach', 'TRAIN', 4.0, 8, 5, 'Every 15 mins', ['Chennai Beach/Fort', 'Chepauk (Marina)']),
  createEdge('MRTS Railway Line', 'Marina Beach', 'Mylapore', 'TRAIN', 3.1, 6, 5, 'Every 15 mins', ['Chepauk', 'Light House', 'Thirumayilai (Mylapore)']),
  createEdge('MRTS Railway Line', 'Mylapore', 'Adyar', 'TRAIN', 4.3, 8, 5, 'Every 15 mins', ['Thirumayilai', 'Mandaveli', 'Greenways Rd', 'Kasturba Nagar (Adyar)']),
  createEdge('MRTS Railway Line', 'Adyar', 'Thiruvanmiyur', 'TRAIN', 2.3, 5, 5, 'Every 15 mins', ['Kasturba Nagar', 'Indira Nagar', 'Thiruvanmiyur']),
  createEdge('MRTS Railway Line', 'Thiruvanmiyur', 'Velachery', 'TRAIN', 4.8, 9, 5, 'Every 15 mins', ['Thiruvanmiyur', 'Taramani', 'Perungudi', 'Velachery']),

  // ===================== BUS (MTC) ROUTES =====================
  // Route 570: Koyambedu <-> Vadapalani <-> Ashok Nagar <-> Guindy <-> Velachery <-> Sholinganallur
  createEdge('Bus 570 (Express)', 'Koyambedu', 'Vadapalani', 'BUS', 3.8, 12, 10, 'Every 10 mins', ['Koyambedu CMBT', 'Vadapalani Junction']),
  createEdge('Bus 570 (Express)', 'Vadapalani', 'Ashok Nagar', 'BUS', 2.0, 7, 7, 'Every 10 mins', ['Vadapalani', 'Ashok Pillar']),
  createEdge('Bus 570 (Express)', 'Ashok Nagar', 'Guindy', 'BUS', 4.2, 14, 12, 'Every 10 mins', ['Ashok Pillar', 'CIPET', 'Guindy Kathipara']),
  createEdge('Bus 570 (Express)', 'Guindy', 'Velachery', 'BUS', 5.5, 18, 15, 'Every 8 mins', ['Guindy', 'Checkpost', 'Velachery Bypass']),
  createEdge('Bus 570 (Express)', 'Velachery', 'Sholinganallur', 'BUS', 11.2, 28, 25, 'Every 10 mins', ['Velachery', 'Perungudi', 'Thoraipakkam', 'Sholinganallur']),

  // Route 21G: Central <-> Marina Beach <-> Mylapore <-> Saidapet <-> Guindy <-> Airport <-> Chromepet <-> Tambaram
  createEdge('Bus 21G', 'Chennai Central', 'Marina Beach', 'BUS', 4.2, 15, 10, 'Every 10 mins', ['Central', 'Anna Square', 'Marina Beach']),
  createEdge('Bus 21G', 'Marina Beach', 'Mylapore', 'BUS', 3.5, 12, 10, 'Every 10 mins', ['Marina Beach', 'Luz Corner', 'Mylapore Tank']),
  createEdge('Bus 21G', 'Mylapore', 'Saidapet', 'BUS', 5.0, 18, 14, 'Every 10 mins', ['Mylapore', 'Alwarpet', 'Saidapet']),
  createEdge('Bus 21G', 'Saidapet', 'Guindy', 'BUS', 2.8, 10, 8, 'Every 6 mins', ['Saidapet', 'Guindy Estate']),
  createEdge('Bus 21G', 'Guindy', 'Chennai Airport', 'BUS', 5.2, 16, 14, 'Every 8 mins', ['Guindy', 'Meenambakkam', 'Airport']),
  createEdge('Bus 21G', 'Chennai Airport', 'Chromepet', 'BUS', 5.0, 15, 12, 'Every 8 mins', ['Airport', 'Pallavaram', 'Chromepet']),
  createEdge('Bus 21G', 'Chromepet', 'Tambaram', 'BUS', 5.5, 17, 14, 'Every 6 mins', ['Chromepet', 'Tambaram Sanatorium', 'Tambaram West']),

  // Route 19B: Saidapet <-> Adyar <-> Thiruvanmiyur <-> Sholinganallur
  createEdge('Bus 19B', 'Saidapet', 'Adyar', 'BUS', 4.5, 16, 12, 'Every 12 mins', ['Saidapet', 'Little Mount', 'Adyar Signal']),
  createEdge('Bus 19B', 'Adyar', 'Thiruvanmiyur', 'BUS', 2.5, 9, 8, 'Every 8 mins', ['Adyar', 'Jayanthi', 'Thiruvanmiyur Depot']),
  createEdge('Bus 19B', 'Thiruvanmiyur', 'Sholinganallur', 'BUS', 10.5, 26, 22, 'Every 10 mins', ['Thiruvanmiyur', 'Kandanchavadi', 'Karapakkam', 'Sholinganallur']),

  // Route 23C: Anna Nagar <-> Nungambakkam <-> T. Nagar <-> Saidapet <-> Adyar <-> Thiruvanmiyur
  createEdge('Bus 23C', 'Anna Nagar', 'Nungambakkam', 'BUS', 6.0, 22, 16, 'Every 10 mins', ['Anna Nagar West', 'Aminjikarai', 'Sterling Rd', 'Nungambakkam']),
  createEdge('Bus 23C', 'Nungambakkam', 'T. Nagar', 'BUS', 3.0, 12, 9, 'Every 8 mins', ['Nungambakkam High Rd', 'Valluvar Kottam', 'Panagal Park (T. Nagar)']),
  createEdge('Bus 23C', 'T. Nagar', 'Saidapet', 'BUS', 2.5, 10, 8, 'Every 6 mins', ['T. Nagar Panagal Park', 'Saidapet Signal']),
  createEdge('Bus 23C', 'Saidapet', 'Adyar', 'BUS', 4.5, 15, 12, 'Every 10 mins', ['Saidapet', 'Anna Univ', 'Adyar']),

  // Route 27B: Marina Beach <-> Central <-> Egmore <-> Vadapalani <-> Koyambedu
  createEdge('Bus 27B', 'Marina Beach', 'Egmore', 'BUS', 4.8, 17, 12, 'Every 12 mins', ['Marina', 'Triplicane', 'Egmore']),
  createEdge('Bus 27B', 'Egmore', 'Nungambakkam', 'BUS', 3.2, 12, 10, 'Every 10 mins', ['Egmore', 'Chetpet', 'Nungambakkam']),
  createEdge('Bus 27B', 'Nungambakkam', 'Vadapalani', 'BUS', 5.5, 19, 15, 'Every 10 mins', ['Nungambakkam', 'Kodambakkam', 'Vadapalani']),
  createEdge('Bus 27B', 'Vadapalani', 'Koyambedu', 'BUS', 3.5, 13, 10, 'Every 8 mins', ['Vadapalani', 'SAF Games Village', 'Koyambedu CMBT']),

  // Route 54 / 54B: Central <-> Egmore <-> Guindy <-> Porur
  createEdge('Bus 54', 'Chennai Central', 'Egmore', 'BUS', 2.5, 10, 7, 'Every 10 mins', ['Central', 'Egmore']),
  createEdge('Bus 54', 'Egmore', 'Guindy', 'BUS', 9.2, 32, 22, 'Every 12 mins', ['Egmore', 'Saidapet', 'Guindy']),
  createEdge('Bus 54', 'Guindy', 'Porur', 'BUS', 7.5, 24, 18, 'Every 10 mins', ['Guindy Kathipara', 'Butt Road', 'Ramapuram', 'Porur']),

  // Route 70V: Koyambedu <-> Porur <-> Guindy <-> Airport <-> Chromepet <-> Tambaram
  createEdge('Bus 70V', 'Koyambedu', 'Porur', 'BUS', 6.8, 22, 16, 'Every 12 mins', ['Koyambedu', 'Maduravoyal', 'Porur']),
  createEdge('Bus 70V', 'Porur', 'Guindy', 'BUS', 7.5, 24, 18, 'Every 10 mins', ['Porur', 'Ramapuram', 'Guindy']),

  // Route 40A / 20N: Ambattur <-> Perambur <-> Central
  createEdge('Bus 40A', 'Ambattur', 'Perambur', 'BUS', 10.2, 30, 20, 'Every 15 mins', ['Ambattur OT', 'Padi', 'Kolathur', 'Perambur']),
  createEdge('Bus 40A', 'Perambur', 'Chennai Central', 'BUS', 5.5, 18, 12, 'Every 10 mins', ['Perambur', 'Pulianthope', 'Central']),

  // Route 47A: Anna Nagar <-> Nungambakkam <-> T. Nagar <-> Adyar
  createEdge('Bus 47A', 'T. Nagar', 'Adyar', 'BUS', 6.2, 20, 16, 'Every 10 mins', ['T. Nagar', 'Saidapet', 'Gandhi Mandapam', 'Adyar']),

  // Route 32B / 1A: Washermanpet <-> Chennai Central
  createEdge('Bus 32B', 'Washermanpet', 'Chennai Central', 'BUS', 4.0, 16, 10, 'Every 8 mins', ['Washermanpet', 'Broadway', 'Chennai Central']),
];

function createEdge(
  routeName: string,
  from: string,
  to: string,
  mode: 'BUS' | 'TRAIN' | 'METRO' | 'AUTO',
  distanceKm: number,
  durationMins: number,
  fareInr: number,
  frequency: string,
  stops: string[]
): TransitEdge {
  return {
    id: `${mode}-${from}-${to}-${routeName}`.toLowerCase().replace(/[\s()\/]+/g, '-'),
    from,
    to,
    mode,
    distanceKm,
    durationMins,
    fareInr,
    routeName,
    frequency,
    trafficLevel: mode === 'METRO' || mode === 'TRAIN' ? 'Low' : durationMins > 20 ? 'Heavy' : 'Moderate',
    stops,
  };
}
