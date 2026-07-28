'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OccupancyBadge } from './occupancy-badge';
import type { Property } from '@/lib/types';

export function PropertyTable({ properties }: { properties: Property[] }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Label</TableHead>
            <TableHead className="text-right">Active tenants</TableHead>
            <TableHead>Occupancy</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((p) => (
            <TableRow
              key={p.id}
              className="cursor-pointer"
              onClick={() => router.push(`/properties/${p.id}`)}
            >
              <TableCell>
                <div className="font-medium">{p.address}</div>
                <div className="text-xs text-muted-foreground">
                  Unit {p.unitNumber}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {p.label ?? '—'}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {p.activeTenantCount}
              </TableCell>
              <TableCell>
                <OccupancyBadge status={p.occupancyStatus} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
