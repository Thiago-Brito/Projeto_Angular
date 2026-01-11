import type { VisitaTipo } from './visita';

export interface VisitaItem {
  id?: string;
  visitaId?: string;
  produtoId: number | string;
  possuia?: number;
  possua?: number;
  entregue: number;
  vendido: number;
  retirado: number;
  possuiAgora?: number;
  tipo?: VisitaTipo;
}

export interface VisitaItemLegacy {
  visita_id?: string;
  produto_id?: number | string;
  possui_agora?: number;
}
