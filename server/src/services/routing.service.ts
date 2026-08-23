import { CHENNAI_LOCATIONS, TRANSIT_EDGES, TransitLocation, TransitEdge } from './graph.service.js';

export interface RouteStep {
  stepNumber: number;
  instruction: string;
  mode: 'BUS' | 'TRAIN' | 'METRO' | 'AUTO' | 'WALK';
  fromStop: string;
  toStop: string;
  distanceKm: number;
  durationMins: number;
  lineName?: string;
}

export interface RouteOption {
  id: string;
  mode: 'BUS' | 'TRAIN' | 'METRO' | 'AUTO' | 'MULTIMODAL';
  modeLabel: string;
  source: string;
  destination: string;
  totalTimeMins: number;
  totalDistanceKm: number;
  totalFareInr: number;
  routeName: string;
  boardingLocation: string;
  destinationStop: string;
  frequency: string;
  interchanges: number;
  trafficLevel: 'Low' | 'Moderate' | 'Heavy';
  steps: RouteStep[];
  pathCoordinates: [number, number][]; // [lat, lng]
  isFastest?: boolean;
  isCheapest?: boolean;
  isShortest?: boolean;
  estimatedTrafficNote: string;
}

export interface ComparisonChartItem {
  mode: string;
  timeMins: number;
  fareInr: number;
  distanceKm: number;
}

export class RoutingService {
  /**
   * Computes Haversine distance in km between two lat/lon points
   */
  static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  /**
   * Retrieves location info by name
   */
  static getLocationByName(name: string): TransitLocation | undefined {
    return CHENNAI_LOCATIONS.find(
      (loc) => loc.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  }

  /**
   * Generates direct Auto-rickshaw option between any two locations
   */
  static generateAutoOption(source: TransitLocation, dest: TransitLocation): RouteOption {
    const directDist = this.haversineDistance(
      source.latitude,
      source.longitude,
      dest.latitude,
      dest.longitude
    );
    const roadDist = parseFloat((directDist * 1.28).toFixed(1)); // Road circuity factor
    const avgSpeed = roadDist > 10 ? 28 : 22; // km/h
    const travelTime = Math.max(8, Math.round((roadDist / avgSpeed) * 60) + 4); // +4 min pickup/turn
    // Base fare: ₹40 for first 1.5 km + ₹18/km thereafter + ₹5 tech fee
    const extraDist = Math.max(0, roadDist - 1.5);
    const fare = Math.round(40 + extraDist * 18 + 5);

    const steps: RouteStep[] = [
      {
        stepNumber: 1,
        instruction: `Board Auto-rickshaw at ${source.name}`,
        mode: 'AUTO',
        fromStop: source.name,
        toStop: `${source.name} Stand`,
        distanceKm: 0.1,
        durationMins: 2,
        lineName: 'Direct City Auto',
      },
      {
        stepNumber: 2,
        instruction: `Ride via arterial road connection directly to ${dest.name} (${roadDist} km)`,
        mode: 'AUTO',
        fromStop: source.name,
        toStop: dest.name,
        distanceKm: roadDist,
        durationMins: travelTime - 2,
        lineName: 'Direct City Auto',
      },
      {
        stepNumber: 3,
        instruction: `Arrive at destination: ${dest.name}`,
        mode: 'AUTO',
        fromStop: dest.name,
        toStop: dest.name,
        distanceKm: 0,
        durationMins: 0,
        lineName: 'Direct City Auto',
      },
    ];

    return {
      id: `route-auto-${source.name}-${dest.name}`.toLowerCase().replace(/[\s.]+/g, '-'),
      mode: 'AUTO',
      modeLabel: 'Auto-rickshaw',
      source: source.name,
      destination: dest.name,
      totalTimeMins: travelTime,
      totalDistanceKm: roadDist,
      totalFareInr: fare,
      routeName: 'Direct Chennai Auto-rickshaw',
      boardingLocation: `${source.name} Stand / App Pickup`,
      destinationStop: `${dest.name} Drop Point`,
      frequency: 'Immediate on demand',
      interchanges: 0,
      trafficLevel: roadDist > 8 ? 'Moderate' : 'Low',
      steps,
      pathCoordinates: [
        [source.latitude, source.longitude],
        [
          (source.latitude + dest.latitude) / 2 + 0.005,
          (source.longitude + dest.longitude) / 2 - 0.004,
        ],
        [dest.latitude, dest.longitude],
      ],
      estimatedTrafficNote: 'Estimated city road traffic; actual time may vary by ±10 mins during peak rush hours.',
    };
  }

  /**
   * Builds an adjacency list representation of the Chennai multimodal network
   */
  private static getAdjacencyList(filterMode?: 'BUS' | 'TRAIN' | 'METRO') {
    const adj = new Map<string, { neighbor: string; edge: TransitEdge }[]>();

    // Initialize map
    for (const loc of CHENNAI_LOCATIONS) {
      adj.set(loc.name, []);
    }

    const filteredEdges = filterMode
      ? TRANSIT_EDGES.filter((e) => e.mode === filterMode)
      : TRANSIT_EDGES;

    for (const edge of filteredEdges) {
      // Forward
      if (adj.has(edge.from)) {
        adj.get(edge.from)!.push({ neighbor: edge.to, edge });
      }
      // Reverse
      if (adj.has(edge.to)) {
        const reverseEdge: TransitEdge = {
          ...edge,
          id: `${edge.id}-rev`,
          from: edge.to,
          to: edge.from,
        };
        adj.get(edge.to)!.push({ neighbor: edge.from, edge: reverseEdge });
      }
    }

    return adj;
  }

  /**
   * Dijkstra's Algorithm optimizing for MINIMUM TRAVEL TIME or MINIMUM FARE
   */
  static dijkstraSearch(
    sourceName: string,
    destName: string,
    metric: 'TIME' | 'FARE',
    filterMode?: 'BUS' | 'TRAIN' | 'METRO'
  ): { path: TransitEdge[]; totalScore: number } | null {
    const adj = this.getAdjacencyList(filterMode);
    const distances = new Map<string, number>();
    const previous = new Map<string, { node: string; edge: TransitEdge } | null>();
    const unvisited = new Set<string>();

    for (const loc of CHENNAI_LOCATIONS) {
      distances.set(loc.name, Infinity);
      previous.set(loc.name, null);
      unvisited.add(loc.name);
    }

    distances.set(sourceName, 0);

    while (unvisited.size > 0) {
      // Pick unvisited node with smallest distance
      let current: string | null = null;
      let minDistance = Infinity;
      for (const node of unvisited) {
        const d = distances.get(node)!;
        if (d < minDistance) {
          minDistance = d;
          current = node;
        }
      }

      if (!current || minDistance === Infinity) break;
      if (current === destName) break;

      unvisited.delete(current);

      const neighbors = adj.get(current) || [];
      for (const { neighbor, edge } of neighbors) {
        if (!unvisited.has(neighbor)) continue;

        // Weight computation
        let weight = metric === 'TIME' ? edge.durationMins : edge.fareInr;

        // Add 3 min interchange penalty if switching line/mode
        const prevStep = previous.get(current);
        if (prevStep && prevStep.edge.routeName !== edge.routeName && metric === 'TIME') {
          weight += 3;
        }

        const alt = distances.get(current)! + weight;
        if (alt < distances.get(neighbor)!) {
          distances.set(neighbor, alt);
          previous.set(neighbor, { node: current, edge });
        }
      }
    }

    // Reconstruct path
    const path: TransitEdge[] = [];
    let curr = destName;
    while (previous.get(curr)) {
      const p = previous.get(curr)!;
      path.unshift(p.edge);
      curr = p.node;
    }

    if (path.length === 0 && sourceName !== destName) {
      return null;
    }

    return {
      path,
      totalScore: distances.get(destName) || 0,
    };
  }

  /**
   * A* Algorithm optimizing for SHORTEST PHYSICAL DISTANCE
   * Heuristic h(n) = Haversine distance to target (admissible & consistent)
   */
  static aStarShortestDistance(
    sourceName: string,
    destName: string,
    filterMode?: 'BUS' | 'TRAIN' | 'METRO'
  ): { path: TransitEdge[]; totalDistanceKm: number } | null {
    const destLoc = this.getLocationByName(destName);
    if (!destLoc) return null;

    const adj = this.getAdjacencyList(filterMode);
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const previous = new Map<string, { node: string; edge: TransitEdge } | null>();
    const openSet = new Set<string>();

    for (const loc of CHENNAI_LOCATIONS) {
      gScore.set(loc.name, Infinity);
      fScore.set(loc.name, Infinity);
      previous.set(loc.name, null);
    }

    gScore.set(sourceName, 0);
    const sourceLoc = this.getLocationByName(sourceName)!;
    const initialH = this.haversineDistance(
      sourceLoc.latitude,
      sourceLoc.longitude,
      destLoc.latitude,
      destLoc.longitude
    );
    fScore.set(sourceName, initialH);
    openSet.add(sourceName);

    while (openSet.size > 0) {
      // Pick node in openSet with lowest fScore
      let current: string | null = null;
      let lowestF = Infinity;
      for (const node of openSet) {
        const f = fScore.get(node)!;
        if (f < lowestF) {
          lowestF = f;
          current = node;
        }
      }

      if (!current) break;
      if (current === destName) {
        // Reconstruct path
        const path: TransitEdge[] = [];
        let curr = destName;
        while (previous.get(curr)) {
          const p = previous.get(curr)!;
          path.unshift(p.edge);
          curr = p.node;
        }
        return {
          path,
          totalDistanceKm: gScore.get(destName) || 0,
        };
      }

      openSet.delete(current);

      const neighbors = adj.get(current) || [];
      for (const { neighbor, edge } of neighbors) {
        const tentativeG = gScore.get(current)! + edge.distanceKm;

        if (tentativeG < gScore.get(neighbor)!) {
          previous.set(neighbor, { node: current, edge });
          gScore.set(neighbor, tentativeG);

          const neighborLoc = this.getLocationByName(neighbor)!;
          const h = this.haversineDistance(
            neighborLoc.latitude,
            neighborLoc.longitude,
            destLoc.latitude,
            destLoc.longitude
          );
          fScore.set(neighbor, tentativeG + h);
          openSet.add(neighbor);
        }
      }
    }

    return null;
  }

  /**
   * Converts edge array into structured RouteOption with coordinates, steps, and interchange info
   */
  private static formatRouteOption(
    idPrefix: string,
    sourceName: string,
    destName: string,
    edges: TransitEdge[]
  ): RouteOption | null {
    if (!edges || edges.length === 0) return null;

    let totalTime = 0;
    let totalDist = 0;
    let totalFare = 0;
    const steps: RouteStep[] = [];
    const coordinates: [number, number][] = [];

    const startLoc = this.getLocationByName(sourceName);
    if (startLoc) coordinates.push([startLoc.latitude, startLoc.longitude]);

    const uniqueModes = new Set(edges.map((e) => e.mode));
    let interchanges = 0;

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      totalTime += edge.durationMins;
      totalDist += edge.distanceKm;
      totalFare += edge.fareInr;

      if (i > 0 && edges[i - 1].routeName !== edge.routeName) {
        interchanges++;
        totalTime += 3; // 3 min interchange penalty
      }

      const toLoc = this.getLocationByName(edge.to);
      if (toLoc) {
        coordinates.push([toLoc.latitude, toLoc.longitude]);
      }

      steps.push({
        stepNumber: i + 1,
        instruction:
          i === 0
            ? `Board ${edge.mode} (${edge.routeName}) at ${edge.from} towards ${edge.to}`
            : edges[i - 1].routeName !== edge.routeName
            ? `Interchange to ${edge.mode} (${edge.routeName}) at ${edge.from} towards ${edge.to}`
            : `Continue on ${edge.mode} (${edge.routeName}) to ${edge.to}`,
        mode: edge.mode,
        fromStop: edge.from,
        toStop: edge.to,
        distanceKm: edge.distanceKm,
        durationMins: edge.durationMins,
        lineName: edge.routeName,
      });
    }

    // Final step
    steps.push({
      stepNumber: steps.length + 1,
      instruction: `Arrive at destination stop: ${destName}`,
      mode: edges[edges.length - 1].mode,
      fromStop: destName,
      toStop: destName,
      distanceKm: 0,
      durationMins: 0,
      lineName: edges[edges.length - 1].routeName,
    });

    const dominantMode =
      uniqueModes.size === 1 ? Array.from(uniqueModes)[0] : 'MULTIMODAL';

    const modeLabels: Record<string, string> = {
      BUS: 'Bus (MTC)',
      TRAIN: 'Chennai Suburban Train',
      METRO: 'Chennai Metro (CMRL)',
      AUTO: 'Auto-rickshaw',
      MULTIMODAL: 'Multi-Modal Transit',
    };

    return {
      id: `${idPrefix}-${sourceName}-${destName}-${edges.map((e) => e.routeName).join('-')}`
        .toLowerCase()
        .replace(/[\s()\/.]+/g, '-'),
      mode: dominantMode as any,
      modeLabel: modeLabels[dominantMode] || dominantMode,
      source: sourceName,
      destination: destName,
      totalTimeMins: Math.round(totalTime),
      totalDistanceKm: parseFloat(totalDist.toFixed(1)),
      totalFareInr: Math.round(totalFare),
      routeName: edges.map((e) => e.routeName).filter((v, i, a) => a.indexOf(v) === i).join(' ➔ '),
      boardingLocation: `${edges[0].from} (${edges[0].mode} Station/Stop)`,
      destinationStop: `${destName} (${edges[edges.length - 1].mode} Station/Stop)`,
      frequency: edges[0].frequency || 'Every 10 mins',
      interchanges,
      trafficLevel:
        dominantMode === 'METRO' || dominantMode === 'TRAIN'
          ? 'Low'
          : totalTime > 35
          ? 'Heavy'
          : 'Moderate',
      steps,
      pathCoordinates: coordinates,
      estimatedTrafficNote: 'Transit schedules and fare estimates based on official academic timetables.',
    };
  }

  /**
   * Main route comparison engine
   * Computes Fastest, Cheapest, Shortest, mode-filtered options, and chart metrics
   */
  static calculateRoutes(sourceName: string, destName: string): {
    source: TransitLocation;
    destination: TransitLocation;
    summary: {
      fastest: RouteOption;
      cheapest: RouteOption;
      shortest: RouteOption;
    };
    allRoutes: RouteOption[];
    comparisonChart: ComparisonChartItem[];
  } {
    const source = this.getLocationByName(sourceName);
    const dest = this.getLocationByName(destName);

    if (!source || !dest) {
      throw new Error(`Invalid location specified: "${!source ? sourceName : destName}".`);
    }

    if (source.name === dest.name) {
      throw new Error('Source and destination cannot be the same location.');
    }

    const routeCandidates: RouteOption[] = [];

    // 1. Auto option is always available for any city pair
    const autoOption = this.generateAutoOption(source, dest);
    routeCandidates.push(autoOption);

    // 2. Multimodal Dijkstra for Fastest (min time)
    const fastestMultimodal = this.dijkstraSearch(source.name, dest.name, 'TIME');
    if (fastestMultimodal && fastestMultimodal.path.length > 0) {
      const opt = this.formatRouteOption('opt-fastest', source.name, dest.name, fastestMultimodal.path);
      if (opt) routeCandidates.push(opt);
    }

    // 3. Multimodal Dijkstra for Cheapest (min fare)
    const cheapestMultimodal = this.dijkstraSearch(source.name, dest.name, 'FARE');
    if (cheapestMultimodal && cheapestMultimodal.path.length > 0) {
      const opt = this.formatRouteOption('opt-cheapest', source.name, dest.name, cheapestMultimodal.path);
      if (opt) routeCandidates.push(opt);
    }

    // 4. A* for Shortest Distance
    const shortestAStar = this.aStarShortestDistance(source.name, dest.name);
    if (shortestAStar && shortestAStar.path.length > 0) {
      const opt = this.formatRouteOption('opt-shortest', source.name, dest.name, shortestAStar.path);
      if (opt) routeCandidates.push(opt);
    }

    // 5. Dedicated mode queries (Pure Bus, Pure Train, Pure Metro)
    const pureMetro = this.dijkstraSearch(source.name, dest.name, 'TIME', 'METRO');
    if (pureMetro && pureMetro.path.length > 0) {
      const opt = this.formatRouteOption('opt-metro', source.name, dest.name, pureMetro.path);
      if (opt) routeCandidates.push(opt);
    }

    const pureTrain = this.dijkstraSearch(source.name, dest.name, 'TIME', 'TRAIN');
    if (pureTrain && pureTrain.path.length > 0) {
      const opt = this.formatRouteOption('opt-train', source.name, dest.name, pureTrain.path);
      if (opt) routeCandidates.push(opt);
    }

    const pureBus = this.dijkstraSearch(source.name, dest.name, 'TIME', 'BUS');
    if (pureBus && pureBus.path.length > 0) {
      const opt = this.formatRouteOption('opt-bus', source.name, dest.name, pureBus.path);
      if (opt) routeCandidates.push(opt);
    }

    // Deduplicate candidate routes by (totalTime, totalFare, totalDistance, routeName)
    const uniqueRoutes: RouteOption[] = [];
    const seen = new Set<string>();

    for (const r of routeCandidates) {
      const signature = `${r.mode}-${r.totalTimeMins}-${r.totalFareInr}-${r.totalDistanceKm}-${r.routeName}`;
      if (!seen.has(signature)) {
        seen.add(signature);
        uniqueRoutes.push(r);
      }
    }

    // Determine absolute Fastest, Cheapest, Shortest
    let fastestRoute = uniqueRoutes[0];
    let cheapestRoute = uniqueRoutes[0];
    let shortestRoute = uniqueRoutes[0];

    for (const r of uniqueRoutes) {
      if (r.totalTimeMins < fastestRoute.totalTimeMins) {
        fastestRoute = r;
      }
      if (r.totalFareInr < cheapestRoute.totalFareInr) {
        cheapestRoute = r;
      }
      if (r.totalDistanceKm < shortestRoute.totalDistanceKm) {
        shortestRoute = r;
      }
    }

    // Assign ribbons
    for (const r of uniqueRoutes) {
      if (r.id === fastestRoute.id) r.isFastest = true;
      if (r.id === cheapestRoute.id) r.isCheapest = true;
      if (r.id === shortestRoute.id) r.isShortest = true;
    }

    // Prepare Comparison Chart Data
    const comparisonChart: ComparisonChartItem[] = [];
    const modesInCandidates = ['METRO', 'TRAIN', 'BUS', 'AUTO'];
    const modeDisplayNames: Record<string, string> = {
      METRO: 'Metro',
      TRAIN: 'Train',
      BUS: 'Bus (MTC)',
      AUTO: 'Auto',
    };

    for (const m of modesInCandidates) {
      const matching = uniqueRoutes.find((r) => r.mode === m);
      if (matching) {
        comparisonChart.push({
          mode: modeDisplayNames[m] || m,
          timeMins: matching.totalTimeMins,
          fareInr: matching.totalFareInr,
          distanceKm: matching.totalDistanceKm,
        });
      }
    }

    return {
      source,
      destination: dest,
      summary: {
        fastest: fastestRoute,
        cheapest: cheapestRoute,
        shortest: shortestRoute,
      },
      allRoutes: uniqueRoutes,
      comparisonChart,
    };
  }
}
