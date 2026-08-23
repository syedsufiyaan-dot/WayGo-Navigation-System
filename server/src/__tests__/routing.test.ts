import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { RoutingService } from '../services/routing.service.js';

describe('WayGo Route Calculation & Transit Engine Test Suite', () => {
  it('should fetch all active Chennai transit locations (at least 24)', async () => {
    const res = await request(app).get('/api/routes/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(24);

    const names = res.body.data.map((l: any) => l.name);
    expect(names).toContain('Chennai Central');
    expect(names).toContain('Anna Nagar');
    expect(names).toContain('Velachery');
    expect(names).toContain('Sholinganallur');
    expect(names).toContain('Tambaram');
    expect(names).toContain('Chennai Airport');
  });

  it('should reject route search when source and destination are identical', async () => {
    const res = await request(app)
      .post('/api/routes/calculate')
      .send({
        source: 'Chennai Central',
        destination: 'Chennai Central',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('cannot be the same');
  });

  it('should calculate valid multi-modal routes between Chennai Central and Anna Nagar', async () => {
    const res = await request(app)
      .post('/api/routes/calculate')
      .send({
        source: 'Chennai Central',
        destination: 'Anna Nagar',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.fastest).toBeDefined();
    expect(res.body.data.summary.cheapest).toBeDefined();
    expect(res.body.data.summary.shortest).toBeDefined();
    expect(res.body.data.routes.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.comparisonChart.length).toBeGreaterThanOrEqual(2);

    // Verify fastest route is Metro Green Line (around 14-15 mins)
    const fastest = res.body.data.summary.fastest;
    expect(fastest.totalTimeMins).toBeLessThanOrEqual(20);
    expect(fastest.steps.length).toBeGreaterThanOrEqual(2);
  });

  it('should calculate valid routes between Velachery and Sholinganallur (OMR IT Corridor)', async () => {
    const res = await request(app)
      .post('/api/routes/calculate')
      .send({
        source: 'Velachery',
        destination: 'Sholinganallur',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.routes.length).toBeGreaterThanOrEqual(1);

    const hasBusOrAuto = res.body.data.routes.some(
      (r: any) => r.mode === 'BUS' || r.mode === 'AUTO'
    );
    expect(hasBusOrAuto).toBe(true);
  });

  it('should calculate valid routes between Tambaram and Chennai Airport (South Line)', async () => {
    const res = await request(app)
      .post('/api/routes/calculate')
      .send({
        source: 'Tambaram',
        destination: 'Chennai Airport',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const cheapest = res.body.data.summary.cheapest;
    // Suburban train fare is ₹5
    expect(cheapest.totalFareInr).toBeLessThanOrEqual(15);
  });

  it('should properly filter routes by mode', async () => {
    const res = await request(app)
      .post('/api/routes/calculate')
      .send({
        source: 'Chennai Central',
        destination: 'Anna Nagar',
        modeFilter: 'METRO',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.routes.every((r: any) => r.mode === 'METRO')).toBe(true);
  });

  it('should verify Dijkstra minimum time algorithm unit implementation', () => {
    const result = RoutingService.dijkstraSearch('Chennai Central', 'Egmore', 'TIME');
    expect(result).not.toBeNull();
    expect(result!.path.length).toBeGreaterThan(0);
    expect(result!.totalScore).toBeLessThanOrEqual(5); // ~4-5 mins by Metro/Train
  });

  it('should verify A* shortest distance algorithm unit implementation with Haversine heuristic', () => {
    const result = RoutingService.aStarShortestDistance('Chennai Central', 'Egmore');
    expect(result).not.toBeNull();
    expect(result!.path.length).toBeGreaterThan(0);
    expect(result!.totalDistanceKm).toBeLessThanOrEqual(3.0); // ~2.1 km
  });
});
