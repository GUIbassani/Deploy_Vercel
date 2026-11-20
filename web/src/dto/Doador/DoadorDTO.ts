export interface DoadorResponseDTO {
  id: number;
  usuarioId: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDoadorDTO {
  usuarioId: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
}

export type UpdateDoadorDTO = Partial<CreateDoadorDTO>;