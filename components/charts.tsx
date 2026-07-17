'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

const asComp = <T,>(m: T): ComponentType<any> => m as unknown as ComponentType<any>;

export const AreaChart = dynamic(
  () => import('recharts').then((m) => asComp(m.AreaChart)),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-lg bg-card/40" /> }
);
export const LineChart = dynamic(
  () => import('recharts').then((m) => asComp(m.LineChart)),
  { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-lg bg-card/40" /> }
);
export const BarChart = dynamic(
  () => import('recharts').then((m) => asComp(m.BarChart)),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-lg bg-card/40" /> }
);
export const Area = dynamic(() => import('recharts').then((m) => asComp(m.Area)), { ssr: false });
export const Line = dynamic(() => import('recharts').then((m) => asComp(m.Line)), { ssr: false });
export const Bar = dynamic(() => import('recharts').then((m) => asComp(m.Bar)), { ssr: false });
export const Cell = dynamic(() => import('recharts').then((m) => asComp(m.Cell)), { ssr: false });
export const XAxis = dynamic(() => import('recharts').then((m) => asComp(m.XAxis)), { ssr: false });
export const YAxis = dynamic(() => import('recharts').then((m) => asComp(m.YAxis)), { ssr: false });
export const Tooltip = dynamic(() => import('recharts').then((m) => asComp(m.Tooltip)), { ssr: false });
export const CartesianGrid = dynamic(() => import('recharts').then((m) => asComp(m.CartesianGrid)), { ssr: false });
export const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => asComp(m.ResponsiveContainer)),
  { ssr: false }
);
