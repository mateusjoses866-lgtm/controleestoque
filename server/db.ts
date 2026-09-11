import fs from 'fs';
import path from 'path';
import { Material, Department, Movement, Requisition, InventoryKPIs } from '../src/types';

interface DatabaseSchema {
  materials: Material[];
  departments: Department[];
  movements: Movement[];
  requisitions: Requisition[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dep-1',
    code: 'SET-01',
    name: 'Manutenção Mecânica & Elétrica',
    manager: 'Eng. Ricardo Prado',
    costCenter: 'CC-2010',
    location: 'Galpão 03 - Oficina Geral',
    email: 'manutencao@empresa.com.br',
    phone: '(11) 3450-2010',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'dep-2',
    code: 'SET-02',
    name: 'Produção Industrial - Linha A',
    manager: 'Carlos Eduardo Maia',
    costCenter: 'CC-1001',
    location: 'Pavilhão Principal - Bloco P1',
    email: 'producao.a@empresa.com.br',
    phone: '(11) 3450-1001',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'dep-3',
    code: 'SET-03',
    name: 'Segurança do Trabalho (SESMT)',
    manager: 'Dra. Beatriz Nogueira',
    costCenter: 'CC-5010',
    location: 'Prédio Administrativo - Sala 104',
    email: 'sesmt@empresa.com.br',
    phone: '(11) 3450-5010',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'dep-4',
    code: 'SET-04',
    name: 'Tecnologia da Informação & Infra',
    manager: 'Fernando Mendes',
    costCenter: 'CC-4020',
    location: 'Data Center - Piso Superior',
    email: 'ti@empresa.com.br',
    phone: '(11) 3450-4020',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'dep-5',
    code: 'SET-05',
    name: 'Logística & Expedição',
    manager: 'Marcelo Torres',
    costCenter: 'CC-3005',
    location: 'Doca Central de Carga e Descarga',
    email: 'logistica@empresa.com.br',
    phone: '(11) 3450-3005',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'dep-6',
    code: 'SET-06',
    name: 'Administração & Suprimentos',
    manager: 'Helena Castro',
    costCenter: 'CC-6001',
    location: 'Edifício Central - 2º Andar',
    email: 'adm@empresa.com.br',
    phone: '(11) 3450-6001',
    createdAt: '2026-01-15T08:00:00.000Z'
  }
];

const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    code: 'MAT-0101',
    name: 'Luva de Vaqueta Mista Petroleira',
    category: 'EPI & Proteção Individual',
    unit: 'PAR',
    minQuantity: 50,
    maxQuantity: 200,
    currentQuantity: 32, // Abaixo do mínimo
    unitPrice: 28.50,
    location: 'Prateleira A-01 / Gaveta 04',
    description: 'Luva de segurança confeccionada em vaqueta na palma e dorso de raspa com elástico no punho.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-08T14:20:00.000Z'
  },
  {
    id: 'mat-2',
    code: 'MAT-0102',
    name: 'Óculos de Segurança Antirrisco e Antiembaçante',
    category: 'EPI & Proteção Individual',
    unit: 'UN',
    minQuantity: 30,
    maxQuantity: 120,
    currentQuantity: 85,
    unitPrice: 19.90,
    location: 'Prateleira A-02 / Caixa 12',
    description: 'Óculos com lente de policarbonato com proteção UV400 e hastes flexíveis com regulagem.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-05T09:15:00.000Z'
  },
  {
    id: 'mat-3',
    code: 'MAT-0201',
    name: 'Rolamento Rígido de Esferas 6205-2RS C3',
    category: 'Peças & Componentes Mecânicos',
    unit: 'PC',
    minQuantity: 15,
    maxQuantity: 60,
    currentQuantity: 8, // Crítico / Abaixo do mínimo
    unitPrice: 46.80,
    location: 'Bancada B-03 / Armário Blindado 2',
    description: 'Rolamento com vedação de borracha nitrílica em ambos os lados e folga radial C3 para motores.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-10T11:45:00.000Z'
  },
  {
    id: 'mat-4',
    code: 'MAT-0202',
    name: 'Correia de Transmissão Industrial em V Perfil B-48',
    category: 'Peças & Componentes Mecânicos',
    unit: 'PC',
    minQuantity: 10,
    maxQuantity: 40,
    currentQuantity: 52, // Excesso de estoque
    unitPrice: 38.00,
    location: 'Prateleira B-01 / Cabide 08',
    description: 'Correia de borracha sintética reforçada com cordonéis de poliéster para compressores e tornos.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-02T16:00:00.000Z'
  },
  {
    id: 'mat-5',
    code: 'MAT-0301',
    name: 'Óleo Lubrificante Hidráulico Sintético ISO VG 68',
    category: 'Lubrificantes & Químicos',
    unit: 'LT',
    minQuantity: 100,
    maxQuantity: 500,
    currentQuantity: 280,
    unitPrice: 34.20,
    location: 'Área Química 01 / Tambor 4B',
    description: 'Fluido hidráulico mineral de alta performance com aditivos antidesgaste e antioxidantes.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-09T10:30:00.000Z'
  },
  {
    id: 'mat-6',
    code: 'MAT-0302',
    name: 'Graxa Azul de Lítio EP-2 para Altas Rotações',
    category: 'Lubrificantes & Químicos',
    unit: 'KG',
    minQuantity: 20,
    maxQuantity: 100,
    currentQuantity: 88,
    unitPrice: 52.00,
    location: 'Área Química 02 / Balde 12',
    description: 'Graxa multiuso extrema pressão recomendada para mancais, rolamentos e juntas universais.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-04T13:10:00.000Z'
  },
  {
    id: 'mat-7',
    code: 'MAT-0401',
    name: 'Disco de Corte Fino Inox 4.1/2" x 1,0mm',
    category: 'Ferramentas & Abrasivos',
    unit: 'UN',
    minQuantity: 80,
    maxQuantity: 300,
    currentQuantity: 42, // Abaixo do mínimo
    unitPrice: 6.50,
    location: 'Armário D-01 / Prateleira 2',
    description: 'Disco com telas de fibra de vidro de alta resistência para corte rápido e sem rebarbas em inox.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-07T15:30:00.000Z'
  },
  {
    id: 'mat-8',
    code: 'MAT-0402',
    name: 'Eletrodo Revestido AWS E7018 3,25mm',
    category: 'Soldagem & Serralheria',
    unit: 'KG',
    minQuantity: 50,
    maxQuantity: 200,
    currentQuantity: 140,
    unitPrice: 24.90,
    location: 'Estufa de Eletrodos E-01',
    description: 'Eletrodo de baixo hidrogênio para soldagem de alta responsabilidade em estruturas metálicas.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-06T11:00:00.000Z'
  },
  {
    id: 'mat-9',
    code: 'MAT-0501',
    name: 'Cabo de Rede UTP Cat6 4 Pares 100% Cobre',
    category: 'Tecnologia da Informação & Redes',
    unit: 'MT',
    minQuantity: 200,
    maxQuantity: 1000,
    currentQuantity: 1250, // Excesso
    unitPrice: 4.80,
    location: 'Racks T-02 / Carretel 01',
    description: 'Cabo homologado pela Anatel para infraestrutura de rede Gigabit Ethernet.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-01T08:45:00.000Z'
  },
  {
    id: 'mat-10',
    code: 'MAT-0502',
    name: 'Conector Modular RJ-45 Cat6 com Guia',
    category: 'Tecnologia da Informação & Redes',
    unit: 'CX',
    minQuantity: 10,
    maxQuantity: 50,
    currentQuantity: 28,
    unitPrice: 65.00,
    location: 'Gaveteiro T-01 / Gaveta 03',
    description: 'Caixa com 100 unidades de conectores banhados a ouro 50 microns.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-03T10:00:00.000Z'
  },
  {
    id: 'mat-11',
    code: 'MAT-0601',
    name: 'Papel Sulfite Chamex A4 75g/m² Branco',
    category: 'Materiais de Escritório & Papelaria',
    unit: 'CX',
    minQuantity: 20,
    maxQuantity: 80,
    currentQuantity: 62,
    unitPrice: 175.00,
    location: 'Almoxarifado Geral / Palete 04',
    description: 'Caixa contendo 10 resmas de 500 folhas de alta alvura para impressoras laser e jato de tinta.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-08T09:00:00.000Z'
  },
  {
    id: 'mat-12',
    code: 'MAT-0602',
    name: 'Fita Gomada Reforçada com Fio de Nylon 70mm',
    category: 'Embalagem & Expedição',
    unit: 'ROLO',
    minQuantity: 30,
    maxQuantity: 120,
    currentQuantity: 95,
    unitPrice: 32.50,
    location: 'Expedição / Prateleira E-03',
    description: 'Fita para fechamento seguro de caixas de papelão pesado com adesivo ativado por água.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-05T14:40:00.000Z'
  }
];

const INITIAL_MOVEMENTS: Movement[] = [
  {
    id: 'mov-1',
    type: 'ENTRADA',
    materialId: 'mat-1',
    materialCode: 'MAT-0101',
    materialName: 'Luva de Vaqueta Mista Petroleira',
    materialUnit: 'PAR',
    quantity: 100,
    balanceBefore: 20,
    balanceAfter: 120,
    departmentId: 'dep-6',
    departmentName: 'Administração & Suprimentos',
    requester: 'Almoxarifado Central (Recebimento)',
    documentNumber: 'NF-e 89432',
    reason: 'Reposição periódica de estoque de segurança com fornecedor EPI Brasil',
    date: '2026-02-15T09:30:00.000Z'
  },
  {
    id: 'mov-2',
    type: 'SAIDA',
    materialId: 'mat-1',
    materialCode: 'MAT-0101',
    materialName: 'Luva de Vaqueta Mista Petroleira',
    materialUnit: 'PAR',
    quantity: 45,
    balanceBefore: 120,
    balanceAfter: 75,
    departmentId: 'dep-2',
    departmentName: 'Produção Industrial - Linha A',
    requester: 'Carlos Eduardo Maia',
    documentNumber: 'REQ-2026-0001',
    reason: 'Distribuição mensal de EPIs obrigatórios para equipe do turno matutino',
    date: '2026-02-20T14:15:00.000Z',
    requisitionId: 'req-1'
  },
  {
    id: 'mov-3',
    type: 'SAIDA',
    materialId: 'mat-1',
    materialCode: 'MAT-0101',
    materialName: 'Luva de Vaqueta Mista Petroleira',
    materialUnit: 'PAR',
    quantity: 43,
    balanceBefore: 75,
    balanceAfter: 32,
    departmentId: 'dep-1',
    departmentName: 'Manutenção Mecânica & Elétrica',
    requester: 'Eng. Ricardo Prado',
    documentNumber: 'REQ-2026-0002',
    reason: 'Atendimento à parada programada de manutenção nos fornos industriais',
    date: '2026-03-08T14:20:00.000Z',
    requisitionId: 'req-2'
  },
  {
    id: 'mov-4',
    type: 'ENTRADA',
    materialId: 'mat-3',
    materialCode: 'MAT-0201',
    materialName: 'Rolamento Rígido de Esferas 6205-2RS C3',
    materialUnit: 'PC',
    quantity: 20,
    balanceBefore: 0,
    balanceAfter: 20,
    departmentId: 'dep-6',
    departmentName: 'Administração & Suprimentos',
    requester: 'Almoxarifado Central (Recebimento)',
    documentNumber: 'NF-e 89510',
    reason: 'Compra emergencial de componentes de reposição SKF',
    date: '2026-02-22T11:00:00.000Z'
  },
  {
    id: 'mov-5',
    type: 'SAIDA',
    materialId: 'mat-3',
    materialCode: 'MAT-0201',
    materialName: 'Rolamento Rígido de Esferas 6205-2RS C3',
    materialUnit: 'PC',
    quantity: 12,
    balanceBefore: 20,
    balanceAfter: 8,
    departmentId: 'dep-1',
    departmentName: 'Manutenção Mecânica & Elétrica',
    requester: 'Técnico Lúcio Martins',
    documentNumber: 'REQ-2026-0003',
    reason: 'Substituição preventiva nos mancais dos motores da linha de laminação',
    date: '2026-03-10T11:45:00.000Z'
  },
  {
    id: 'mov-6',
    type: 'ENTRADA',
    materialId: 'mat-5',
    materialCode: 'MAT-0301',
    materialName: 'Óleo Lubrificante Hidráulico Sintético ISO VG 68',
    materialUnit: 'LT',
    quantity: 200,
    balanceBefore: 120,
    balanceAfter: 320,
    departmentId: 'dep-6',
    departmentName: 'Administração & Suprimentos',
    requester: 'Almoxarifado Central (Recebimento)',
    documentNumber: 'NF-e 89801',
    reason: 'Abastecimento semestral de lubrificantes para o parque fabril',
    date: '2026-02-28T09:00:00.000Z'
  },
  {
    id: 'mov-7',
    type: 'SAIDA',
    materialId: 'mat-5',
    materialCode: 'MAT-0301',
    materialName: 'Óleo Lubrificante Hidráulico Sintético ISO VG 68',
    materialUnit: 'LT',
    quantity: 40,
    balanceBefore: 320,
    balanceAfter: 280,
    departmentId: 'dep-1',
    departmentName: 'Manutenção Mecânica & Elétrica',
    requester: 'Marcos Vinícius',
    documentNumber: 'REQ-2026-0004',
    reason: 'Troca de óleo das prensas hidráulicas 01 e 02',
    date: '2026-03-09T10:30:00.000Z'
  },
  {
    id: 'mov-8',
    type: 'SAIDA',
    materialId: 'mat-7',
    materialCode: 'MAT-0401',
    materialName: 'Disco de Corte Fino Inox 4.1/2" x 1,0mm',
    materialUnit: 'UN',
    quantity: 50,
    balanceBefore: 92,
    balanceAfter: 42,
    departmentId: 'dep-2',
    departmentName: 'Produção Industrial - Linha A',
    requester: 'Supervisor Gilberto Santos',
    documentNumber: 'REQ-2026-0005',
    reason: 'Montagem e acabamento dos chassis metálicos lote 24',
    date: '2026-03-07T15:30:00.000Z'
  }
];

const INITIAL_REQUISITIONS: Requisition[] = [
  {
    id: 'req-1',
    requisitionNumber: 'REQ-2026-0001',
    date: '2026-02-20T14:15:00.000Z',
    departmentId: 'dep-2',
    departmentName: 'Produção Industrial - Linha A',
    requester: 'Carlos Eduardo Maia',
    approver: 'Gerência Operacional',
    warehouseKeeper: 'Matheus Messias',
    purpose: 'Distribuição mensal de EPIs obrigatórios para operadores da Linha A',
    status: 'ATENDIDA',
    items: [
      {
        materialId: 'mat-1',
        materialCode: 'MAT-0101',
        materialName: 'Luva de Vaqueta Mista Petroleira',
        unit: 'PAR',
        quantityRequested: 45,
        quantityDelivered: 45
      }
    ],
    notes: 'Material entregue na íntegra em conformidade com as normas regulamentadoras NR-06.',
    createdAt: '2026-02-20T14:15:00.000Z'
  },
  {
    id: 'req-2',
    requisitionNumber: 'REQ-2026-0002',
    date: '2026-03-08T14:20:00.000Z',
    departmentId: 'dep-1',
    departmentName: 'Manutenção Mecânica & Elétrica',
    requester: 'Eng. Ricardo Prado',
    approver: 'Diretoria Técnica',
    warehouseKeeper: 'Matheus Messias',
    purpose: 'Atendimento emergencial de parada de manutenção corretiva dos fornos',
    status: 'ATENDIDA',
    items: [
      {
        materialId: 'mat-1',
        materialCode: 'MAT-0101',
        materialName: 'Luva de Vaqueta Mista Petroleira',
        unit: 'PAR',
        quantityRequested: 43,
        quantityDelivered: 43
      },
      {
        materialId: 'mat-7',
        materialCode: 'MAT-0401',
        materialName: 'Disco de Corte Fino Inox 4.1/2" x 1,0mm',
        unit: 'UN',
        quantityRequested: 20,
        quantityDelivered: 20
      }
    ],
    notes: 'Prioridade alta para liberação da linha de laminação.',
    createdAt: '2026-03-08T14:20:00.000Z'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error('Error loading database from file, using initial data:', err);
    }

    const defaultData: DatabaseSchema = {
      materials: INITIAL_MATERIALS,
      departments: INITIAL_DEPARTMENTS,
      movements: INITIAL_MOVEMENTS,
      requisitions: INITIAL_REQUISITIONS
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      this.data = data;
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  // --- Materials ---
  getMaterials(): Material[] {
    return [...this.data.materials];
  }

  getMaterialById(id: string): Material | undefined {
    return this.data.materials.find(m => m.id === id || m.code === id);
  }

  createMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material {
    const newMaterial: Material = {
      ...material,
      id: 'mat-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.materials.push(newMaterial);
    this.saveData(this.data);
    return newMaterial;
  }

  updateMaterial(id: string, updates: Partial<Material>): Material | null {
    const index = this.data.materials.findIndex(m => m.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.data.materials[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.materials[index] = updated;
    this.saveData(this.data);
    return updated;
  }

  deleteMaterial(id: string): boolean {
    const initialLen = this.data.materials.length;
    this.data.materials = this.data.materials.filter(m => m.id !== id);
    if (this.data.materials.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Departments ---
  getDepartments(): Department[] {
    return [...this.data.departments];
  }

  createDepartment(dep: Omit<Department, 'id' | 'createdAt'>): Department {
    const newDep: Department = {
      ...dep,
      id: 'dep-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.data.departments.push(newDep);
    this.saveData(this.data);
    return newDep;
  }

  updateDepartment(id: string, updates: Partial<Department>): Department | null {
    const index = this.data.departments.findIndex(d => d.id === id);
    if (index === -1) return null;
    const updated = { ...this.data.departments[index], ...updates };
    this.data.departments[index] = updated;
    this.saveData(this.data);
    return updated;
  }

  deleteDepartment(id: string): boolean {
    const initialLen = this.data.departments.length;
    this.data.departments = this.data.departments.filter(d => d.id !== id);
    if (this.data.departments.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Movements ---
  getMovements(): Movement[] {
    // Return sorted newest first
    return [...this.data.movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  recordMovement(params: {
    type: 'ENTRADA' | 'SAIDA';
    materialId: string;
    quantity: number;
    departmentId: string;
    requester: string;
    documentNumber?: string;
    reason: string;
    date?: string;
    requisitionId?: string;
  }): { movement: Movement; material: Material } {
    const material = this.data.materials.find(m => m.id === params.materialId);
    if (!material) {
      throw new Error('Material não encontrado no cadastro.');
    }

    const department = this.data.departments.find(d => d.id === params.departmentId);
    const departmentName = department ? department.name : 'Almoxarifado Central';

    const qty = Number(params.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('A quantidade deve ser um número maior que zero.');
    }

    const balanceBefore = material.currentQuantity;
    let balanceAfter = balanceBefore;

    if (params.type === 'ENTRADA') {
      balanceAfter = balanceBefore + qty;
    } else {
      if (balanceBefore < qty) {
        throw new Error(`Saldo insuficiente em estoque! Saldo disponível: ${balanceBefore} ${material.unit}. Tentativa de saída: ${qty} ${material.unit}.`);
      }
      balanceAfter = balanceBefore - qty;
    }

    // Update material quantity
    material.currentQuantity = balanceAfter;
    material.updatedAt = new Date().toISOString();

    const movement: Movement = {
      id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type: params.type,
      materialId: material.id,
      materialCode: material.code,
      materialName: material.name,
      materialUnit: material.unit,
      quantity: qty,
      balanceBefore,
      balanceAfter,
      departmentId: params.departmentId,
      departmentName,
      requester: params.requester,
      documentNumber: params.documentNumber || (params.type === 'ENTRADA' ? 'NF-AVULSA' : 'REQ-AVULSA'),
      reason: params.reason,
      date: params.date || new Date().toISOString(),
      requisitionId: params.requisitionId
    };

    this.data.movements.push(movement);
    this.saveData(this.data);

    return { movement, material };
  }

  // --- Requisitions ---
  getRequisitions(): Requisition[] {
    return [...this.data.requisitions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  createRequisition(req: {
    departmentId: string;
    requester: string;
    approver: string;
    warehouseKeeper: string;
    purpose: string;
    items: { materialId: string; quantityRequested: number; quantityDelivered?: number }[];
    notes?: string;
    autoProcessStock?: boolean;
  }): Requisition {
    const department = this.data.departments.find(d => d.id === req.departmentId);
    const departmentName = department ? department.name : 'Setor Não Especificado';

    const reqSeq = this.data.requisitions.length + 1;
    const year = new Date().getFullYear();
    const requisitionNumber = `REQ-${year}-${String(reqSeq).padStart(4, '0')}`;
    const reqId = 'req-' + Date.now();

    const processedItems = req.items.map(item => {
      const mat = this.data.materials.find(m => m.id === item.materialId);
      if (!mat) throw new Error(`Material com ID ${item.materialId} não encontrado.`);
      const delivered = item.quantityDelivered !== undefined ? item.quantityDelivered : item.quantityRequested;

      if (req.autoProcessStock && delivered > 0) {
        if (mat.currentQuantity < delivered) {
          throw new Error(`Saldo insuficiente para o item ${mat.name}! Saldo disponível: ${mat.currentQuantity} ${mat.unit}`);
        }
      }

      return {
        materialId: mat.id,
        materialCode: mat.code,
        materialName: mat.name,
        unit: mat.unit,
        quantityRequested: item.quantityRequested,
        quantityDelivered: delivered
      };
    });

    // If autoProcessStock, record movements
    if (req.autoProcessStock) {
      for (const item of processedItems) {
        if (item.quantityDelivered > 0) {
          this.recordMovement({
            type: 'SAIDA',
            materialId: item.materialId,
            quantity: item.quantityDelivered,
            departmentId: req.departmentId,
            requester: req.requester,
            documentNumber: requisitionNumber,
            reason: `Requisição de Material: ${req.purpose}`,
            requisitionId: reqId
          });
        }
      }
    }

    const newRequisition: Requisition = {
      id: reqId,
      requisitionNumber,
      date: new Date().toISOString(),
      departmentId: req.departmentId,
      departmentName,
      requester: req.requester,
      approver: req.approver || 'Chefia Imediata',
      warehouseKeeper: req.warehouseKeeper || 'Almoxarife Responsável',
      purpose: req.purpose,
      status: 'ATENDIDA',
      items: processedItems,
      notes: req.notes,
      createdAt: new Date().toISOString()
    };

    this.data.requisitions.push(newRequisition);
    this.saveData(this.data);

    return newRequisition;
  }

  // --- KPIs & Analytics ---
  getKPIs(): InventoryKPIs {
    const materials = this.data.materials;
    const movements = this.data.movements;

    const totalMaterials = materials.length;
    const totalStockValue = materials.reduce((acc, m) => acc + (m.currentQuantity * m.unitPrice), 0);

    const criticalMaterials = materials.filter(m => m.currentQuantity <= m.minQuantity);
    const excessMaterials = materials.filter(m => m.currentQuantity > m.maxQuantity);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const monthMovements = movements.filter(m => new Date(m.date).getTime() >= startOfMonth);
    const entriesCountMonth = monthMovements.filter(m => m.type === 'ENTRADA').length;
    const exitsCountMonth = monthMovements.filter(m => m.type === 'SAIDA').length;

    // Department grouping
    const depMap = new Map<string, { totalQuantity: number; movementCount: number }>();
    movements.forEach(m => {
      const depName = m.departmentName || 'Geral';
      const existing = depMap.get(depName) || { totalQuantity: 0, movementCount: 0 };
      existing.totalQuantity += m.quantity;
      existing.movementCount += 1;
      depMap.set(depName, existing);
    });

    const movementsByDepartment = Array.from(depMap.entries()).map(([departmentName, stat]) => ({
      departmentName,
      totalQuantity: stat.totalQuantity,
      movementCount: stat.movementCount
    })).sort((a, b) => b.totalQuantity - a.totalQuantity);

    // Turnover calculation: (Total exits quantity / Average stock quantity)
    const totalCurrentStock = materials.reduce((acc, m) => acc + m.currentQuantity, 0);
    const totalExitsQty = movements.filter(m => m.type === 'SAIDA').reduce((acc, m) => acc + m.quantity, 0);
    const turnoverRate = totalCurrentStock > 0 ? Number(((totalExitsQty / totalCurrentStock) * 100).toFixed(1)) : 0;

    return {
      totalMaterials,
      totalStockValue,
      belowMinCount: criticalMaterials.length,
      aboveMaxCount: excessMaterials.length,
      totalMovementsMonth: monthMovements.length,
      entriesCountMonth,
      exitsCountMonth,
      turnoverRate,
      criticalMaterials,
      excessMaterials,
      movementsByDepartment,
      recentMovements: this.getMovements().slice(0, 8)
    };
  }

  resetDemoData() {
    this.data = {
      materials: INITIAL_MATERIALS,
      departments: INITIAL_DEPARTMENTS,
      movements: INITIAL_MOVEMENTS,
      requisitions: INITIAL_REQUISITIONS
    };
    this.saveData(this.data);
    return { success: true, message: 'Dados restaurados para o padrão de demonstração.' };
  }
}

export const db = new Database();
