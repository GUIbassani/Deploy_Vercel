export interface InstituicaoResponseDTO {
  id: number;
  nome: string;
  endereco?: string | null;
  telefone?: string | null;
  tipo: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInstituicaoDTO {
  nome: string;
  endereco?: string;
  telefone?: string;
  tipo: string;
}

export type UpdateInstituicaoDTO = Partial<CreateInstituicaoDTO>;