export interface Cliente {
    id: number;
    nome: string;
    localidade: string;
    email: string;
    telefone: string;
    endereco: string;
    comissao: number;
    selecionado?: boolean;
}
