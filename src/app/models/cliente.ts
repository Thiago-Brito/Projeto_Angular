export interface Cliente {
    id: string;
    nome: string;
    localidadeId: number;
    localidade?: string;
    email: string;
    telefone: string;
    endereco: string;
    comissao: number;
    selecionado?: boolean;
}
