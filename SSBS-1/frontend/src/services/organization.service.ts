// @ts-nocheck
// ── Organization service ──

import api from '../lib/axios';
import { API_ENDPOINTS } from '../config/api.config';
import type { Organization, OrganizationCreate } from '../types/api';

export async function getOrganizations(): Promise<Organization[]> {
  const { data } = await api.get<Organization[]>(API_ENDPOINTS.organizations.list);
  return data;
}

export async function getOrganization(id: number): Promise<Organization> {
  const { data } = await api.get<Organization>(API_ENDPOINTS.organizations.detail(id));
  return data;
}

export async function createOrganization(payload: OrganizationCreate): Promise<Organization> {
  const { data } = await api.post<Organization>(API_ENDPOINTS.organizations.list, payload);
  return data;
}

export async function updateOrganization(id: number, payload: Partial<OrganizationCreate>): Promise<Organization> {
  const { data } = await api.patch<Organization>(API_ENDPOINTS.organizations.detail(id), payload);
  return data;
}

export async function deleteOrganization(id: number): Promise<void> {
  await api.delete(API_ENDPOINTS.organizations.detail(id));
}
