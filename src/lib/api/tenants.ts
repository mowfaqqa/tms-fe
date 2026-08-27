import { api } from './client';
import type {
  ExpiringFilter,
  IdentificationType,
  MaritalStatus,
  Notice,
  Paginated,
  Reminder,
  Tenant,
  TenantStatus,
} from '@/lib/types';

export interface TenantListParams {
  page?: number;
  limit?: number;
  search?: string;
  expiring?: ExpiringFilter;
  status?: TenantStatus;
}

export interface TenantPayload {
  fullName: string;
  phoneNumber: string;
  email: string;
  propertyId: string;
  tenancyStartDate: string;
  tenancyEndDate: string;
  rentAmount: number;
  status?: TenantStatus;
  /** The tenant is paying the rent in instalments. */
  isPartPayment?: boolean;
  /** Create-only: recorded as the opening instalment in the payment ledger. */
  depositAmount?: number;
  // Acquaintance-form fields — all optional. Send null to clear a stored value.
  age?: number | null;
  profession?: string | null;
  nationality?: string | null;
  homeAddress?: string | null;
  officeAddress?: string | null;
  officePhoneNumber?: string | null;
  maritalStatus?: MaritalStatus | null;
  stateOfOrigin?: string | null;
  lga?: string | null;
  spouseName?: string | null;
  spouseOfficeAddress?: string | null;
  spousePhoneNumber?: string | null;
  numberOfChildren?: number | null;
  numberOfDependants?: number | null;
  identificationType?: IdentificationType | null;
  identificationNumber?: string | null;
  lastResidentialAddress?: string | null;
  reasonForLeaving?: string | null;
  applicantSignature?: string | null;
  applicantSignedAt?: string | null;
  agentName?: string | null;
  refereeName?: string | null;
  refereeProfession?: string | null;
  refereeAddress?: string | null;
  refereePhoneNumber?: string | null;
  refereeSignature?: string | null;
  refereeSignedAt?: string | null;
  remark?: string | null;
  serviceCharge?: number | null;
  generalRemark?: string | null;
  officialSignature?: string | null;
  officialSignedAt?: string | null;
}

export interface RenewTenancyPayload {
  tenancyStartDate: string;
  tenancyEndDate: string;
  rentAmount: number;
  /** Renew into a different unit. Staff may only name a property they hold. */
  propertyId?: string;
  serviceCharge?: number;
}

export const tenantsApi = {
  async list(params: TenantListParams): Promise<Paginated<Tenant>> {
    const { data } = await api.get<Paginated<Tenant>>('/tenants', { params });
    return data;
  },

  async get(id: string): Promise<Tenant> {
    const { data } = await api.get<Tenant>(`/tenants/${id}`);
    return data;
  },

  async reminders(id: string): Promise<Reminder[]> {
    const { data } = await api.get<Reminder[]>(`/tenants/${id}/reminders`);
    return data;
  },

  async notices(id: string): Promise<Notice[]> {
    const { data } = await api.get<Notice[]>(`/tenants/${id}/notices`);
    return data;
  },

  async create(payload: TenantPayload): Promise<Tenant> {
    const { data } = await api.post<Tenant>('/tenants', payload);
    return data;
  },

  async update(
    id: string,
    payload: Partial<TenantPayload>,
  ): Promise<Tenant> {
    const { data } = await api.patch<Tenant>(`/tenants/${id}`, payload);
    return data;
  },

  /** Supersedes the current term and returns the new one. */
  async renew(id: string, payload: RenewTenancyPayload): Promise<Tenant> {
    const { data } = await api.post<Tenant>(`/tenants/${id}/renew`, payload);
    return data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/tenants/${id}`);
    return data;
  },
};
