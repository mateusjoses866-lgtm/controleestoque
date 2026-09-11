import { Material, Department, Movement, Requisition, InventoryKPIs } from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Erro na requisição (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Materials
  async getMaterials(): Promise<Material[]> {
    const res = await fetch('/api/materials');
    return handleResponse<Material[]>(res);
  },

  async createMaterial(data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<Material> {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Material>(res);
  },

  async updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Material>(res);
  },

  async deleteMaterial(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getMaterialHistory(id: string): Promise<Movement[]> {
    const res = await fetch(`/api/materials/${id}/history`);
    return handleResponse<Movement[]>(res);
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await fetch('/api/departments');
    return handleResponse<Department[]>(res);
  },

  async createDepartment(data: Omit<Department, 'id' | 'createdAt'>): Promise<Department> {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Department>(res);
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    const res = await fetch(`/api/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Department>(res);
  },

  async deleteDepartment(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/departments/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Movements
  async getMovements(): Promise<Movement[]> {
    const res = await fetch('/api/movements');
    return handleResponse<Movement[]>(res);
  },

  async recordMovement(params: {
    type: 'ENTRADA' | 'SAIDA';
    materialId: string;
    quantity: number;
    departmentId: string;
    requester: string;
    documentNumber?: string;
    reason: string;
    date?: string;
    requisitionId?: string;
  }): Promise<{ movement: Movement; material: Material }> {
    const res = await fetch('/api/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return handleResponse<{ movement: Movement; material: Material }>(res);
  },

  // Requisitions
  async getRequisitions(): Promise<Requisition[]> {
    const res = await fetch('/api/requisitions');
    return handleResponse<Requisition[]>(res);
  },

  async createRequisition(data: {
    departmentId: string;
    requester: string;
    approver?: string;
    warehouseKeeper?: string;
    purpose: string;
    items: { materialId: string; quantityRequested: number; quantityDelivered?: number }[];
    notes?: string;
    autoProcessStock?: boolean;
  }): Promise<Requisition> {
    const res = await fetch('/api/requisitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Requisition>(res);
  },

  // KPIs
  async getKPIs(): Promise<InventoryKPIs> {
    const res = await fetch('/api/kpis');
    return handleResponse<InventoryKPIs>(res);
  },

  // Reset Data
  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/reset-data', {
      method: 'POST'
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  }
};
