export type UnitOfMeasure = 'UN' | 'KG' | 'CX' | 'LT' | 'MT' | 'PC' | 'PAR' | 'ROLO' | 'FARDO';

export type MovementType = 'ENTRADA' | 'SAIDA';

export type StockStatus = 'CRITICO' | 'ABAIXO_MINIMO' | 'NORMAL' | 'EXCESSO';

export interface Material {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: UnitOfMeasure | string;
  minQuantity: number;
  maxQuantity: number;
  currentQuantity: number;
  unitPrice: number;
  location: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  manager: string;
  costCenter: string;
  location: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface Movement {
  id: string;
  type: MovementType;
  materialId: string;
  materialCode: string;
  materialName: string;
  materialUnit: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  departmentId: string;
  departmentName: string;
  requester: string;
  documentNumber?: string;
  reason: string;
  date: string;
  requisitionId?: string;
}

export interface RequisitionItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  quantityRequested: number;
  quantityDelivered: number;
}

export type RequisitionStatus = 'ATENDIDA' | 'PENDENTE' | 'CANCELADA';

export interface Requisition {
  id: string;
  requisitionNumber: string;
  date: string;
  departmentId: string;
  departmentName: string;
  requester: string;
  approver: string;
  warehouseKeeper: string;
  purpose: string;
  status: RequisitionStatus;
  items: RequisitionItem[];
  notes?: string;
  createdAt: string;
}

export interface InventoryKPIs {
  totalMaterials: number;
  totalStockValue: number;
  belowMinCount: number;
  aboveMaxCount: number;
  totalMovementsMonth: number;
  entriesCountMonth: number;
  exitsCountMonth: number;
  turnoverRate: number;
  criticalMaterials: Material[];
  excessMaterials: Material[];
  movementsByDepartment: {
    departmentName: string;
    totalQuantity: number;
    movementCount: number;
  }[];
  recentMovements: Movement[];
}

export interface InventoryReportFilter {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  materialId?: string;
  type?: MovementType | 'TODOS';
  status?: StockStatus | 'TODOS';
  category?: string;
}
