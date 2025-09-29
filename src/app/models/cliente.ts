export interface Cliente {
    id: string;
    nome: string;
    localidade: string;
    email: string;
    telefone: string;
    endereco: string;
    comissao: number;
    selecionado?: boolean;
}