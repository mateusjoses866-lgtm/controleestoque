import { Material, StockStatus } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getStockStatus(material: Material): {
  status: StockStatus;
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  const { currentQuantity, minQuantity, maxQuantity } = material;

  if (currentQuantity <= 0) {
    return {
      status: 'CRITICO',
      label: 'Ruptura (Zerado)',
      badgeClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      dotClass: 'bg-rose-500 animate-pulse'
    };
  }

  if (currentQuantity <= minQuantity) {
    return {
      status: 'ABAIXO_MINIMO',
      label: 'Abaixo do Mínimo',
      badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
      dotClass: 'bg-amber-400'
    };
  }

  if (currentQuantity > maxQuantity) {
    return {
      status: 'EXCESSO',
      label: 'Estoque Excessivo',
      badgeClass: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
      dotClass: 'bg-purple-400'
    };
  }

  return {
    status: 'NORMAL',
    label: 'Normal / Regular',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    dotClass: 'bg-emerald-400'
  };
}

export function exportToCSV(filename: string, rows: Record<string, any>[], headers: { key: string; label: string }[]) {
  const headerRow = headers.map(h => `"${h.label}"`).join(';');
  const dataRows = rows.map(row => {
    return headers.map(h => {
      const val = row[h.key];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(';');
  });

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
