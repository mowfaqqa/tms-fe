import type { Tenant } from './types';

const HEADERS = [
  'Full Name',
  'Phone',
  'Email',
  'Property Address',
  'Unit',
  'Tenancy Start',
  'Tenancy End',
  'Rent Amount',
  'Status',
];

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Builds a CSV from tenant rows and triggers a browser download. */
export function exportTenantsToCsv(rows: Tenant[], filename: string): void {
  const lines = [HEADERS.join(',')];
  for (const t of rows) {
    lines.push(
      [
        t.fullName,
        t.phoneNumber,
        t.email,
        t.propertyAddress,
        t.unitNumber,
        t.tenancyStartDate.slice(0, 10),
        t.tenancyEndDate.slice(0, 10),
        String(t.rentAmount),
        t.status,
      ]
        .map((v) => escapeCell(String(v ?? '')))
        .join(','),
    );
  }

  const blob = new Blob([lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
