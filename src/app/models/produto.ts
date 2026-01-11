export interface Produto {
    id?: string;
    nome: string;
    preco: number;
    categoriaId: number;
    categoria?: string;
    selecionado?: boolean;
}
