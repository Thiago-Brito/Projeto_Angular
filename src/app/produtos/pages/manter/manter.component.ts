import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Produto } from '../../models/produto';
import { ProdutoService } from '../../services/produto.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-manter',
  standalone: false,
  templateUrl: './manter.component.html',
  styleUrl: './manter.component.scss'
})
export class ManterComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['check', 'nome', 'preco', 'categoria'];
  nomeBusca: string = '';
  loadingDelete = false;

  produtos = new MatTableDataSource<Produto>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private service: ProdutoService) { }

  ngOnInit(): void {
    this.service.obterTodos().subscribe({
      next: (listaProdutos) => {
        this.produtos.data = listaProdutos.map(p => ({ ...p, selecionado: false }));
      }
    });
  }

  ngAfterViewInit(): void {
    this.produtos.paginator = this.paginator;
  }

  isAllSelected(): boolean {
    return this.produtos.data.length > 0 && this.produtos.data.every(p => p.selecionado);
  }

  toggleMaster(checked: boolean): void {
    this.produtos.data = this.produtos.data.map(p => ({ ...p, selecionado: checked }));
  }

  hasAnySelected(): boolean {
    return this.produtos.data.some(p => p.selecionado);
  }


  deleteSelected(): void {
    const selecionados = this.produtos.data.filter(p => p.selecionado && p.id != null);
    if (selecionados.length === 0) return;

    if (!confirm(`Excluir ${selecionados.length} produto(s)?`)) return;

    this.loadingDelete = true;

    const requests = selecionados.map(p => this.service.deletar(p.id!));

    forkJoin(requests).subscribe({
      next: () => {
        const ids = new Set(selecionados.map(p => p.id));
        this.produtos.data = this.produtos.data.filter(p => !ids.has(p.id));
      },
      error: (err) => {
        console.error('Falha ao excluir em lote', err);
        alert('Não foi possível excluir alguns itens.');
      },
      complete: () => this.loadingDelete = false
    });


  }

   filtrar(): void {
    const filtro = (this.nomeBusca || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    this.produtos.filter = filtro;

    
    if (this.paginator) this.paginator.firstPage();
  }


}
