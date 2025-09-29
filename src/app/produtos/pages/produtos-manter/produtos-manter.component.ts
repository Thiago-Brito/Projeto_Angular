import { Component, OnInit, inject } from '@angular/core';
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

@Component({
  selector: 'app-produtos-manter',
  standalone: true, 
  templateUrl: './produtos-manter.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    CheckboxModule,
  ],
})
export class ProdutosManterComponent  implements OnInit {

  nomeBusca = '';
  loadingDelete = false;

  produtosOrigem: Produto[] = [];
  produtos: Produto[] = [];           
  selecionados: Produto[] = [];       
  
  constructor(private service: ProdutoService) { }
  
  ngOnInit(): void {
    this.service.obterTodos().subscribe({
      next: (listaProdutos) => {
        this.produtosOrigem = listaProdutos ?? [];
        this.produtos = [...this.produtosOrigem];
      },
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
      },
      error: (err) => {
        console.error('Falha ao excluir em lote', err);
        alert('Não foi possível excluir alguns itens.');
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
