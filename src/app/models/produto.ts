export interface Produto {
    id?: string;
    nome: string;
    preco: number;
    categoria: string;
    selecionado?: boolean;
}