import type { VisitaItem } from './visita-item';

export type VisitaTipo = 'VENDA' | 'ENTREGA_DEVOLUCAO';

export interface Visita {
  id?: string;
  clienteId?: number | string;
  dataVisita?: string;
  observacoes: string;
  tipo?: VisitaTipo;
  itens?: VisitaItem[];
  cliente_id?: string;
  data_visita?: string;
}

export interface VisitaItemPayload {
  produtoId: string;
  possuia: number;
  vendido: number;
  entregue: number;
  retirado: number;
}

export interface VisitaPayload {
  clienteId: string;
  dataVisita: string;
  tipo: VisitaTipo;
  observacoes: string;
  itens: VisitaItemPayload[];
}
