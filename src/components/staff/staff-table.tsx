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
import { StaffStatusBadge } from './staff-status-badge';
import type { StaffUser } from '@/lib/types';

export function StaffTable({ staff }: { staff: StaffUser[] }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Assigned properties</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((s) => (
            <TableRow
              key={s.id}
              className="cursor-pointer"
              onClick={() => router.push(`/staff/${s.id}`)}
            >
              <TableCell className="font-medium">{s.fullName}</TableCell>
              <TableCell className="text-muted-foreground">
                {s.email}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {s.staffAssignments.length}
              </TableCell>
              <TableCell>
                <StaffStatusBadge isActive={s.isActive} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
