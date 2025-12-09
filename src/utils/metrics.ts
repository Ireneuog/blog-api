// src/utils/metrics.ts
import client from 'prom-client';

const register = new client.Registry();

// Métrica: número de pedidos HTTP por rota e método
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Número total de pedidos HTTP',
  labelNames: ['method', 'route', 'status'] as const,
});

register.registerMetric(httpRequestsTotal);

// Métrica: duração dos pedidos
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração dos pedidos HTTP em segundos',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestDurationSeconds);

// Exporta o Registry
export { register };
