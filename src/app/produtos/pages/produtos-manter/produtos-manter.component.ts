import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';

import { forkJoin } from 'rxjs';
import { Produto } from '../../../models/produto';
import { ProdutoService } from '../../../services/produto.service';
import { ToastModule } from "primeng/toast";
import { MessageService } from 'primeng/api';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria';

@Component({
  selector: 'app-produtos-manter',
  standalone: true, 
  templateUrl: './produtos-manter.component.html',
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    CheckboxModule,
    ToastModule
],
})
export class ProdutosManterComponent  implements OnInit {

  nomeBusca = '';
  loadingDelete = false;

  produtosOrigem: Produto[] = [];
  produtos: Produto[] = [];           
  selecionados: Produto[] = [];       
  
  constructor(
    private service: ProdutoService,
    private categoriaService: CategoriaService,
    private messageService: MessageService
  ) { }
  
  ngOnInit(): void {
    forkJoin({
      produtos: this.service.obterTodos(),
      categorias: this.categoriaService.obterTodos()
    }).subscribe({
      next: ({ produtos, categorias }) => {
        const categoriaById = new Map<string, string>();
        (categorias || []).forEach((c: Categoria) => {
          if (c.id != null) categoriaById.set(String(c.id), c.nome);
        });

        const listaProdutos = (produtos || []).map((p) => ({
          ...p,
          categoria: categoriaById.get(String(p.categoriaId ?? '')) ?? ''
        }));

        this.produtosOrigem = listaProdutos;
        this.produtos = [...this.produtosOrigem];
      },
      error: (err) => {
        console.error('Erro ao carregar produtos/categorias', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar produtos.'
        });
      }
    });
  }

  hasAnySelected(): boolean {
    return this.selecionados.length > 0;
  }

  deleteSelected(): void {
    if (!this.hasAnySelected()) return;
    if (!confirm(`Excluir ${this.selecionados.length} produto(s)?`)) return;

    this.loadingDelete = true;
    const reqs = this.selecionados
      .filter(p => p.id != null)
      .map(p => this.service.deletar(p.id!));

    forkJoin(reqs).subscribe({
      next: () => {
        const ids = new Set(this.selecionados.map(p => p.id));
        this.produtosOrigem = this.produtosOrigem.filter(p => !ids.has(p.id));
        this.filtrar();        
        this.selecionados = [];
        this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto(s) deletado com sucesso!'
          });
      },
      error: (err) => {
        console.error('Falha ao excluir em lote', err);
         this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao deletar o produto.'
          });
      },
      complete: () => (this.loadingDelete = false),
    });
  }

  filtrar(): void {
    const f = (this.nomeBusca || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    this.produtos =
      !f
        ? [...this.produtosOrigem]
        : this.produtosOrigem.filter(p =>
            (p.nome ?? '')
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .includes(f)
          );
  }
}
