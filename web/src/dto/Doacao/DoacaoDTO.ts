
export type StatusDoacao =
  | "PENDENTE"
  | "ENCAMINHADA"
  | "ENTREGUE"
  | "CANCELADA";

export interface DoacaoResponseDTO {
  id: number;
  doadorId: number;
  dataValidade: string;
  status: StatusDoacao;
  observacoes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDoacaoDTO {
  dataValidade: string;
  observacoes?: string;
}

export interface UpdateDoacaoDTO {
  dataValidade?: string;
  observacoes?: string;
}
