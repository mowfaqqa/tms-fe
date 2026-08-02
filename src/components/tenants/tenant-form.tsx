'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/empty-state';
import { useProperties } from '@/lib/hooks/use-properties';
import {
  IDENTIFICATION_TYPE_LABELS,
  MARITAL_STATUS_LABELS,
} from '@/lib/labels';
import type { TenantPayload } from '@/lib/api/tenants';
import type { IdentificationType, MaritalStatus, Tenant } from '@/lib/types';

const MARITAL_STATUSES = Object.keys(
  MARITAL_STATUS_LABELS,
) as MaritalStatus[];
const IDENTIFICATION_TYPES = Object.keys(
  IDENTIFICATION_TYPE_LABELS,
) as IdentificationType[];

/** Optional whole-number field, e.g. age or number of children. */
const optionalCount = (max: number) =>
  z
    .string()
    .optional()
    .refine(
      (v) =>
        !v ||
        (/^\d+$/.test(v) && Number(v) >= 0 && Number(v) <= max),
      { message: `Enter a whole number between 0 and ${max}` },
    );

const schema = z
  .object({
    // Tenant information
    fullName: z.string().min(1, 'Full name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Enter a valid email'),
    age: optionalCount(120),
    profession: z.string().optional(),
    nationality: z.string().optional(),
    homeAddress: z.string().optional(),
    officeAddress: z.string().optional(),
    officePhoneNumber: z.string().optional(),
    stateOfOrigin: z.string().optional(),
    lga: z.string().optional(),
    // Family / dependants
    maritalStatus: z
      .enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED'])
      .optional(),
    spouseName: z.string().optional(),
    spouseOfficeAddress: z.string().optional(),
    spousePhoneNumber: z.string().optional(),
    numberOfChildren: optionalCount(50),
    numberOfDependants: optionalCount(50),
    // Means of identification
    identificationType: z
      .enum(['DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT', 'NATIONAL_ID'])
      .optional(),
    identificationNumber: z.string().optional(),
    // Property
    propertyId: z.string().min(1, 'Property is required'),
    // Tenancy
    tenancyStartDate: z.string().min(1, 'Start date is required'),
    tenancyEndDate: z.string().min(1, 'End date is required'),
    rentAmount: z
      .string()
      .min(1, 'Rent amount is required')
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
        message: 'Enter a valid amount',
      }),
    status: z.enum(['ACTIVE', 'EXPIRED', 'RENEWED']).optional(),
    // Previous residence & referee
    lastResidentialAddress: z.string().optional(),
    reasonForLeaving: z.string().optional(),
    applicantSignature: z.string().optional(),
    applicantSignedAt: z.string().optional(),
    agentName: z.string().optional(),
    refereeName: z.string().optional(),
    refereeProfession: z.string().optional(),
    refereeAddress: z.string().optional(),
    refereePhoneNumber: z.string().optional(),
    refereeSignature: z.string().optional(),
    refereeSignedAt: z.string().optional(),
    // For official use only
    serviceCharge: z
      .string()
      .optional()
      .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
        message: 'Enter a valid amount',
      }),
    generalRemark: z.string().optional(),
    officialSignature: z.string().optional(),
    officialSignedAt: z.string().optional(),
  })
  .refine(
    (v) => new Date(v.tenancyEndDate) > new Date(v.tenancyStartDate),
    { message: 'End date must be after the start date', path: ['tenancyEndDate'] },
  );

export type TenantFormValues = z.infer<typeof schema>;

const EMPTY: TenantFormValues = {
  fullName: '',
  phoneNumber: '',
  email: '',
  age: '',
  profession: '',
  nationality: '',
  homeAddress: '',
  officeAddress: '',
  officePhoneNumber: '',
  stateOfOrigin: '',
  lga: '',
  maritalStatus: undefined,
  spouseName: '',
  spouseOfficeAddress: '',
  spousePhoneNumber: '',
  numberOfChildren: '',
  numberOfDependants: '',
  identificationType: undefined,
  identificationNumber: '',
  propertyId: '',
  tenancyStartDate: '',
  tenancyEndDate: '',
  rentAmount: '',
  status: 'ACTIVE',
  lastResidentialAddress: '',
  reasonForLeaving: '',
  applicantSignature: '',
  applicantSignedAt: '',
  agentName: '',
  refereeName: '',
  refereeProfession: '',
  refereeAddress: '',
  refereePhoneNumber: '',
  refereeSignature: '',
  refereeSignedAt: '',
  serviceCharge: '',
  generalRemark: '',
  officialSignature: '',
  officialSignedAt: '',
};

/** Blank optional inputs clear the stored value rather than saving "". */
const text = (v?: string) => (v && v.trim() ? v.trim() : null);
const count = (v?: string) => (v && v.trim() ? Number(v) : null);
const date = (v?: string) => (v ? v : null);

/** Maps a saved tenant onto the form's string-based fields. */
export function tenantToFormValues(tenant: Tenant): TenantFormValues {
  const str = (v: string | number | null) => (v === null ? '' : String(v));
  const day = (v: string | null) => (v ? v.slice(0, 10) : '');
  return {
    fullName: tenant.fullName,
    phoneNumber: tenant.phoneNumber,
    email: tenant.email,
    age: str(tenant.age),
    profession: str(tenant.profession),
    nationality: str(tenant.nationality),
    homeAddress: str(tenant.homeAddress),
    officeAddress: str(tenant.officeAddress),
    officePhoneNumber: str(tenant.officePhoneNumber),
    stateOfOrigin: str(tenant.stateOfOrigin),
    lga: str(tenant.lga),
    maritalStatus: tenant.maritalStatus ?? undefined,
    spouseName: str(tenant.spouseName),
    spouseOfficeAddress: str(tenant.spouseOfficeAddress),
    spousePhoneNumber: str(tenant.spousePhoneNumber),
    numberOfChildren: str(tenant.numberOfChildren),
    numberOfDependants: str(tenant.numberOfDependants),
    identificationType: tenant.identificationType ?? undefined,
    identificationNumber: str(tenant.identificationNumber),
    propertyId: tenant.propertyId,
    tenancyStartDate: day(tenant.tenancyStartDate),
    tenancyEndDate: day(tenant.tenancyEndDate),
    rentAmount: String(tenant.rentAmount),
    status: tenant.status,
    lastResidentialAddress: str(tenant.lastResidentialAddress),
    reasonForLeaving: str(tenant.reasonForLeaving),
    applicantSignature: str(tenant.applicantSignature),
    applicantSignedAt: day(tenant.applicantSignedAt),
    agentName: str(tenant.agentName),
    refereeName: str(tenant.refereeName),
    refereeProfession: str(tenant.refereeProfession),
    refereeAddress: str(tenant.refereeAddress),
    refereePhoneNumber: str(tenant.refereePhoneNumber),
    refereeSignature: str(tenant.refereeSignature),
    refereeSignedAt: day(tenant.refereeSignedAt),
    serviceCharge: str(tenant.serviceCharge),
    generalRemark: str(tenant.generalRemark),
    officialSignature: str(tenant.officialSignature),
    officialSignedAt: day(tenant.officialSignedAt),
  };
}

function SectionTitle({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {hint ? (
        <p className="text-xs text-muted-foreground/80">{hint}</p>
      ) : null}
    </div>
  );
}

export function TenantForm({
  defaultValues,
  showStatus = false,
  submitLabel = 'Save',
  submitting = false,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<TenantFormValues>;
  showStatus?: boolean;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (payload: TenantPayload) => void;
  onCancel?: () => void;
}) {
  const { data: properties, isLoading: propertiesLoading } = useProperties({
    limit: 100,
  });
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...EMPTY, ...defaultValues },
  });

  const handle = (values: TenantFormValues) => {
    const payload: TenantPayload = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      email: values.email,
      propertyId: values.propertyId,
      tenancyStartDate: values.tenancyStartDate,
      tenancyEndDate: values.tenancyEndDate,
      rentAmount: Number(values.rentAmount),
      ...(showStatus && values.status ? { status: values.status } : {}),
      // Personal details
      age: count(values.age),
      profession: text(values.profession),
      nationality: text(values.nationality),
      homeAddress: text(values.homeAddress),
      officeAddress: text(values.officeAddress),
      officePhoneNumber: text(values.officePhoneNumber),
      stateOfOrigin: text(values.stateOfOrigin),
      lga: text(values.lga),
      // Family / dependants
      maritalStatus: values.maritalStatus ?? null,
      spouseName: text(values.spouseName),
      spouseOfficeAddress: text(values.spouseOfficeAddress),
      spousePhoneNumber: text(values.spousePhoneNumber),
      numberOfChildren: count(values.numberOfChildren),
      numberOfDependants: count(values.numberOfDependants),
      // Means of identification
      identificationType: values.identificationType ?? null,
      identificationNumber: text(values.identificationNumber),
      // Previous residence & referee
      lastResidentialAddress: text(values.lastResidentialAddress),
      reasonForLeaving: text(values.reasonForLeaving),
      applicantSignature: text(values.applicantSignature),
      applicantSignedAt: date(values.applicantSignedAt),
      agentName: text(values.agentName),
      refereeName: text(values.refereeName),
      refereeProfession: text(values.refereeProfession),
      refereeAddress: text(values.refereeAddress),
      refereePhoneNumber: text(values.refereePhoneNumber),
      refereeSignature: text(values.refereeSignature),
      refereeSignedAt: date(values.refereeSignedAt),
      // For official use only
      serviceCharge:
        values.serviceCharge && values.serviceCharge.trim()
          ? Number(values.serviceCharge)
          : null,
      generalRemark: text(values.generalRemark),
      officialSignature: text(values.officialSignature),
      officialSignedAt: date(values.officialSignedAt),
    };
    onSubmit(payload);
  };

  if (
    !propertiesLoading &&
    (!properties || properties.data.length === 0) &&
    !defaultValues?.propertyId
  ) {
    return (
      <EmptyState
        title="No properties available"
        description="Ask an admin to add a property (and assign it to you, if you're staff) before registering a tenant."
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handle)} className="space-y-8">
        <section className="space-y-4">
          <SectionTitle title="Tenant information" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile telephone</FormLabel>
                  <FormControl>
                    <Input placeholder="+234 800 000 0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="officePhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office telephone</FormLabel>
                  <FormControl>
                    <Input placeholder="+234 100 000 0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="120"
                      placeholder="38"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profession</FormLabel>
                  <FormControl>
                    <Input placeholder="Architect" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input placeholder="Nigerian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stateOfOrigin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State of origin</FormLabel>
                  <FormControl>
                    <Input placeholder="Kano" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>L.G.A.</FormLabel>
                  <FormControl>
                    <Input placeholder="Nassarawa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="homeAddress"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Home address</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="12 Marina Road, Lagos"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="officeAddress"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Office address</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="5 Broad Street, Lagos"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <SectionTitle title="Family and dependants" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MARITAL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {MARITAL_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spouseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of spouse</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spousePhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spouse telephone</FormLabel>
                  <FormControl>
                    <Input placeholder="+234 800 000 0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spouseOfficeAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spouse office address</FormLabel>
                  <FormControl>
                    <Input placeholder="9 Awolowo Road, Ikoyi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfChildren"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of children</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfDependants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dependants living with tenant</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <SectionTitle
            title="Means of identification"
            hint="A photocopy of the ID is still collected on paper."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="identificationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {IDENTIFICATION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {IDENTIFICATION_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identificationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID number</FormLabel>
                  <FormControl>
                    <Input placeholder="A01234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <SectionTitle title="Property information" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Property</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties?.data.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.address}, Unit {p.unitNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <SectionTitle title="Tenancy information" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="tenancyStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenancy start date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenancyEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenancy end date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent amount</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="1" placeholder="1500000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showStatus ? (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="RENEWED">Renewed</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <SectionTitle title="Previous residence and referee" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="lastResidentialAddress"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Last residential address</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="4 Herbert Macaulay Way, Yaba"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reasonForLeaving"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Reason for leaving last residence</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Relocated closer to work"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicantSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applicant signature</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Typed name confirming the signed paper form.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicantSignedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date signed</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agentName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Name of agent (if any)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ade Realty" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refereeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referee name</FormLabel>
                  <FormControl>
                    <Input placeholder="Musa Bello" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refereeProfession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referee profession</FormLabel>
                  <FormControl>
                    <Input placeholder="Accountant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refereeAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referee address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="17 Adeola Odeku, Victoria Island"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refereePhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referee telephone</FormLabel>
                  <FormControl>
                    <Input placeholder="+234 801 112 2233" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refereeSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referee signature</FormLabel>
                  <FormControl>
                    <Input placeholder="Musa Bello" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refereeSignedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date signed</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <SectionTitle
            title="For official use only"
            hint="Completed by the agency, not the prospective tenant."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="serviceCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service charge</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="250000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="hidden sm:block" />
            <FormField
              control={form.control}
              name="generalRemark"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>General remark</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Documents verified."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="officialSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Official signature</FormLabel>
                  <FormControl>
                    <Input placeholder="A. Tijani" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="officialSignedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date signed</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="flex items-center justify-end gap-2">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          ) : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
