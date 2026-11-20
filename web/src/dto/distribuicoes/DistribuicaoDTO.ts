
import { DoacaoResponseDTO } from "../doacao/DoacaoDTO";
import { InstituicaoResponseDTO } from "../instituicao/InstituicaoDTO";

export type StatusDistribuicao =
  | "ENCAMINHADA"
  | "ENTREGUE"
  | "CANCELADA";

export interface DistribuicaoResponseDTO {
  id: number;
  doacaoId: number;
  instituicaoId: number;
  dataEncaminhamento?: string;
  dataEntrega?: string | null;
  status: StatusDistribuicao;
  doacao?: DoacaoResponseDTO;
  instituicao?: InstituicaoResponseDTO;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDistribuicaoDTO {
  doacaoId: number;
  instituicaoId: number;
}

export interface UpdateDistribuicaoDTO {
  status: "ENTREGUE" | "CANCELADA";
}
