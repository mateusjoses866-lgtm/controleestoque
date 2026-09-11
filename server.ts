import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Materials Endpoints ---
  app.get('/api/materials', (_req: Request, res: Response) => {
    try {
      const materials = db.getMaterials();
      res.json(materials);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao carregar materiais.' });
    }
  });

  app.post('/api/materials', (req: Request, res: Response) => {
    try {
      const { code, name, category, unit, minQuantity, maxQuantity, currentQuantity, unitPrice, location, description } = req.body;
      if (!name || !code) {
        return res.status(400).json({ error: 'Nome e código do material são obrigatórios.' });
      }

      // Check unique code
      const existing = db.getMaterialById(code);
      if (existing) {
        return res.status(400).json({ error: `Já existe um material com o código ${code}.` });
      }

      const newMaterial = db.createMaterial({
        code: String(code).trim().toUpperCase(),
        name: String(name).trim(),
        category: String(category || 'Diversos').trim(),
        unit: String(unit || 'UN').trim().toUpperCase(),
        minQuantity: Number(minQuantity) || 0,
        maxQuantity: Number(maxQuantity) || 0,
        currentQuantity: Number(currentQuantity) || 0,
        unitPrice: Number(unitPrice) || 0,
        location: String(location || 'Almoxarifado').trim(),
        description: description ? String(description).trim() : ''
      });

      res.status(201).json(newMaterial);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao cadastrar material.' });
    }
  });

  app.put('/api/materials/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.updateMaterial(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Material não encontrado.' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao atualizar material.' });
    }
  });

  app.delete('/api/materials/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteMaterial(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Material não encontrado.' });
      }
      res.json({ success: true, message: 'Material removido com sucesso.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao remover material.' });
    }
  });

  app.get('/api/materials/:id/history', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const movements = db.getMovements().filter(m => m.materialId === id || m.materialCode === id);
      res.json(movements);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao buscar histórico do material.' });
    }
  });

  // --- Departments Endpoints ---
  app.get('/api/departments', (_req: Request, res: Response) => {
    try {
      const departments = db.getDepartments();
      res.json(departments);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao carregar setores.' });
    }
  });

  app.post('/api/departments', (req: Request, res: Response) => {
    try {
      const { code, name, manager, costCenter, location, email, phone } = req.body;
      if (!name || !code) {
        return res.status(400).json({ error: 'Nome e código do setor são obrigatórios.' });
      }

      const newDepartment = db.createDepartment({
        code: String(code).trim().toUpperCase(),
        name: String(name).trim(),
        manager: String(manager || 'Não informado').trim(),
        costCenter: String(costCenter || 'CC-Geral').trim().toUpperCase(),
        location: String(location || 'Sede').trim(),
        email: email ? String(email).trim() : '',
        phone: phone ? String(phone).trim() : ''
      });

      res.status(201).json(newDepartment);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao cadastrar setor.' });
    }
  });

  app.put('/api/departments/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.updateDepartment(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Setor não encontrado.' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao atualizar setor.' });
    }
  });

  app.delete('/api/departments/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteDepartment(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Setor não encontrado.' });
      }
      res.json({ success: true, message: 'Setor removido com sucesso.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao remover setor.' });
    }
  });

  // --- Movements Endpoints ---
  app.get('/api/movements', (_req: Request, res: Response) => {
    try {
      const movements = db.getMovements();
      res.json(movements);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao carregar movimentações.' });
    }
  });

  app.post('/api/movements', (req: Request, res: Response) => {
    try {
      const { type, materialId, quantity, departmentId, requester, documentNumber, reason, date } = req.body;

      if (!type || !materialId || !quantity || !departmentId) {
        return res.status(400).json({ error: 'Tipo, material, quantidade e setor responsável são obrigatórios.' });
      }

      const result = db.recordMovement({
        type,
        materialId,
        quantity: Number(quantity),
        departmentId,
        requester: String(requester || 'Solicitante Não Especificado').trim(),
        documentNumber: documentNumber ? String(documentNumber).trim() : undefined,
        reason: String(reason || 'Movimentação operacional regular').trim(),
        date: date || new Date().toISOString()
      });

      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Erro ao registrar movimentação de estoque.' });
    }
  });

  // --- Requisitions Endpoints ---
  app.get('/api/requisitions', (_req: Request, res: Response) => {
    try {
      const requisitions = db.getRequisitions();
      res.json(requisitions);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao carregar requisições.' });
    }
  });

  app.post('/api/requisitions', (req: Request, res: Response) => {
    try {
      const { departmentId, requester, approver, warehouseKeeper, purpose, items, notes, autoProcessStock } = req.body;

      if (!departmentId || !requester || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Setor, solicitante e ao menos 1 item requisitado são obrigatórios.' });
      }

      const requisition = db.createRequisition({
        departmentId,
        requester: String(requester).trim(),
        approver: approver ? String(approver).trim() : 'Chefia Imediata',
        warehouseKeeper: warehouseKeeper ? String(warehouseKeeper).trim() : 'Matheus Messias',
        purpose: purpose ? String(purpose).trim() : 'Atendimento a demandas operacionais',
        items,
        notes: notes ? String(notes).trim() : '',
        autoProcessStock: Boolean(autoProcessStock)
      });

      res.status(201).json(requisition);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Erro ao emitir requisição.' });
    }
  });

  // --- KPIs / Dashboard Endpoints ---
  app.get('/api/kpis', (_req: Request, res: Response) => {
    try {
      const kpis = db.getKPIs();
      res.json(kpis);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao calcular indicadores.' });
    }
  });

  // --- Reset Database Demo Data ---
  app.post('/api/reset-data', (_req: Request, res: Response) => {
    try {
      const result = db.resetDemoData();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao reiniciar banco de dados.' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ControleEstoque] Servidor corporativo rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
