import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ClienteService } from '../../cliente.service';
import { Cliente } from '../../cliente';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-manter',
  standalone: false,
  templateUrl: './manter.component.html',
  styleUrl: './manter.component.scss'
})
export class ManterComponent {
  displayedColumns: string[] = ['check', 'nome', 'localidade', 'email', 'telefone'];
  nomeBusca: string = '';
  loadingDelete = false;

  clientes = new MatTableDataSource<Cliente>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private service: ClienteService) { }

  ngOnInit(): void {
    this.service.obterTodos().subscribe({
      next: (listaClientes) => {
        this.clientes.data = listaClientes.map(p => ({ ...p, selecionado: false }));
      }
    });
  }

  ngAfterViewInit(): void {
    this.clientes.paginator = this.paginator;
  }

  isAllSelected(): boolean {
    return this.clientes.data.length > 0 && this.clientes.data.every(p => p.selecionado);
  }

  toggleMaster(checked: boolean): void {
    this.clientes.data = this.clientes.data.map(p => ({ ...p, selecionado: checked }));
  }

  hasAnySelected(): boolean {
    return this.clientes.data.some(p => p.selecionado);
  }


  deleteSelected(): void {
    const selecionados = this.clientes.data.filter(p => p.selecionado && p.id != null);
    if (selecionados.length === 0) return;

    if (!confirm(`Excluir ${selecionados.length} Cliente(s)?`)) return;

    this.loadingDelete = true;

    const requests = selecionados.map(p => this.service.deletar(p.id!));

    forkJoin(requests).subscribe({
      next: () => {
        const ids = new Set(selecionados.map(p => p.id));
        this.clientes.data = this.clientes.data.filter(p => !ids.has(p.id));
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
    this.clientes.filter = filtro;

    
    if (this.paginator) this.paginator.firstPage();
  }

}
