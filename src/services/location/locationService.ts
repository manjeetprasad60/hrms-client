import { apiClient } from '../api/apiClient';
import type { CompanyLocation } from './location.types';

class LocationServiceImpl {
  public async getLocation(companyId: string, locationId: string): Promise<CompanyLocation | null> {
    if (!companyId) throw new Error('Company ID is required');
    if (!locationId) throw new Error('Location ID is required');

    try {
      return await apiClient.get<CompanyLocation>(`companies/${companyId}/locations/${locationId}`);
    } catch {
      return null;
    }
  }

  public async getLocations(companyId: string): Promise<CompanyLocation[]> {
    if (!companyId) throw new Error('Company ID is required');

    try {
      const locations = await apiClient.get<Record<string, CompanyLocation> | CompanyLocation[]>(
        `companies/${companyId}/locations`
      );

      if (!locations) return [];
      if (Array.isArray(locations)) return locations;
      return Object.values(locations);
    } catch {
      return [];
    }
  }

  public async createLocation(companyId: string, data: Partial<CompanyLocation>): Promise<CompanyLocation> {
    if (!companyId) throw new Error('Company ID is required');
    if (!data.name?.trim()) throw new Error('Location name is required');

    const locationId = `loc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();

    const location: CompanyLocation = {
      id: locationId,
      name: data.name.trim(),
      type: data.type ?? 'branch',
      address: data.address,
      phone: data.phone,
      email: data.email,
      timezone: data.timezone,
      isHeadquarters: data.isHeadquarters ?? false,
      employeeCount: data.employeeCount ?? 0,
      status: data.status ?? 'active',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await apiClient.post(`companies/${companyId}/locations`, location);
    } catch {
      // Non-blocking in dev
    }
    return location;
  }

  public async updateLocation(
    companyId: string,
    locationId: string,
    updates: Partial<CompanyLocation>
  ): Promise<CompanyLocation> {
    if (!companyId || !locationId) throw new Error('Company ID and Location ID are required');

    const existing = await this.getLocation(companyId, locationId);
    if (!existing) throw new Error('Location not found');

    const updated = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    try {
      await apiClient.patch(`companies/${companyId}/locations/${locationId}`, updated);
    } catch {
      // Non-blocking in dev
    }
    return updated;
  }

  public async archiveLocation(companyId: string, locationId: string): Promise<CompanyLocation> {
    if (!companyId || !locationId) throw new Error('Company ID and Location ID are required');

    const existing = await this.getLocation(companyId, locationId);
    if (!existing) throw new Error('Location not found');

    const now = Date.now();
    const updated: CompanyLocation = {
      ...existing,
      status: 'archived',
      updatedAt: now,
    };

    try {
      await apiClient.patch(`companies/${companyId}/locations/${locationId}`, {
        status: 'archived' as const,
        updatedAt: now,
      });
    } catch {
      // Non-blocking in dev
    }

    return updated;
  }
}

export const locationService = new LocationServiceImpl();
