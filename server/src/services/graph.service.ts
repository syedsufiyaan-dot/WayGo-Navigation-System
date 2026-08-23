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
];

/**
 * Predefined Multimodal Chennai Transit Network Edges
 */
export const TRANSIT_EDGES: TransitEdge[] = [
  // ===================== METRO LINES =====================
  // Metro Green Line: Central <-> Egmore <-> Anna Nagar <-> Koyambedu <-> Vadapalani <-> Ashok Nagar <-> Alandur
  createEdge('Metro Green Line', 'Chennai Central', 'Egmore', 'METRO', 2.1, 4, 10, 'Every 5 mins', ['Chennai Central', 'Egmore']),
  createEdge('Metro Green Line', 'Egmore', 'Anna Nagar', 'METRO', 6.2, 10, 20, 'Every 5 mins', ['Egmore', 'Kilpauk', 'Shenoy Nagar', 'Anna Nagar']),
  createEdge('Metro Green Line', 'Anna Nagar', 'Koyambedu', 'METRO', 2.8, 5, 10, 'Every 5 mins', ['Anna Nagar', 'Thirumangalam', 'Koyambedu']),
  createEdge('Metro Green Line', 'Koyambedu', 'Vadapalani', 'METRO', 3.5, 6, 15, 'Every 5 mins', ['Koyambedu', 'Arumbakkam', 'Vadapalani']),
  createEdge('Metro Green Line', 'Vadapalani', 'Ashok Nagar', 'METRO', 1.8, 3, 10, 'Every 5 mins', ['Vadapalani', 'Ashok Nagar']),
  createEdge('Metro Green Line', 'Ashok Nagar', 'Alandur', 'METRO', 3.6, 6, 15, 'Every 5 mins', ['Ashok Nagar', 'Ekkattuthangal', 'Alandur']),

  // Metro Blue Line: Washermanpet <-> Chennai Central <-> Nungambakkam <-> Saidapet <-> Guindy <-> Alandur <-> Airport
  createEdge('Metro Blue Line', 'Washermanpet', 'Chennai Central', 'METRO', 3.8, 6, 15, 'Every 5 mins', ['Washermanpet', 'Mannadi', 'Chennai Central']),
  createEdge('Metro Blue Line', 'Chennai Central', 'Nungambakkam', 'METRO', 4.5, 7, 20, 'Every 5 mins', ['Chennai Central', 'Govt Estate', 'LIC', 'Nungambakkam AG-DMS']),
  createEdge('Metro Blue Line', 'Nungambakkam', 'Saidapet', 'METRO', 4.1, 6, 15, 'Every 5 mins', ['Nungambakkam AG-DMS', 'Teynampet', 'Nandanam', 'Saidapet']),
  createEdge('Metro Blue Line', 'Saidapet', 'Guindy', 'METRO', 2.4, 4, 10, 'Every 5 mins', ['Saidapet', 'Little Mount', 'Guindy']),
  createEdge('Metro Blue Line', 'Guindy', 'Alandur', 'METRO', 1.5, 3, 10, 'Every 5 mins', ['Guindy', 'Alandur']),
  createEdge('Metro Blue Line', 'Alandur', 'Chennai Airport', 'METRO', 4.2, 6, 20, 'Every 5 mins', ['Alandur', 'Nanganallur', 'Meenambakkam', 'Chennai Airport']),

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
