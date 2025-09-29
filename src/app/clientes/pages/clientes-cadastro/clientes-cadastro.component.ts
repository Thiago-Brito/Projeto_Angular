import { CommonModule, formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { ClientesService } from '../../../services/clientes.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService, TreeNode } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { Localidade } from '../../../models/localidade';
import { LocalidadeService } from '../../../services/localidade.service';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { Produto } from '../../../models/produto';
import { SelectModule } from 'primeng/select';
import { ProdutoService } from '../../../services/produto.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { VisitasService } from '../../../services/visita.service';
import { EstoqueCliente } from '../../../models/estoque-cliente';
import { EstoqueClienteService } from '../../../services/estoque-cliente.service';
import { TreeTableModule } from 'primeng/treetable';
import { Visita } from '../../../models/visita';
import { VisitaItem } from '../../../models/visita-item';
import { VisitaItemService } from '../../../services/visita-item.service';
import { forkJoin, of, switchMap } from 'rxjs';


type VisitaRow = {
  id: string;
  data_visita: string;
  observacoes: string;
  qtdProdutosDistintos: number;
};



@Component({
  selector: 'app-clientes-cadastro',
  providers: [MessageService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    RouterLink,
    ToastModule,
    TabsModule,
    DialogModule,
    TextareaModule,
    DatePickerModule,
    TableModule,
    SelectModule,
    DropdownModule,
    InputNumberModule,
    TreeTableModule
  ],
  templateUrl: './clientes-cadastro.component.html',
  styles: ``
})


export class ClientesCadastroComponent {
  activeTab = '0'
  camposForm: FormGroup;
  visitasForm: FormGroup;
  isAlteracao: boolean = false;
  titulo = 'Cadastrar cliente';
  botaoTexto = 'Cadastrar';
  localidades: Localidade[] = [];
  produtos: Produto[] = [];
  private produtoById = new Map<String, Produto>();

  visitasRows: VisitaRow[] = [];
  loadingVisitas = false;

  somenteLeitura = false;



  dialogAberto = false;
  editando = false;



  private n(v: any): number { return isNaN(+v) ? 0 : +v; }


  constructor(private clienteService: ClientesService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private localidadeService: LocalidadeService,
    private produtoService: ProdutoService,
    private visitasService: VisitasService,
    private estoqueClienteService: EstoqueClienteService,
  ) {
    this.camposForm = new FormGroup({
      id: new FormControl(null),
      nome: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      telefone: new FormControl(''),
      endereco: new FormControl(''),
      localidade: new FormControl('', Validators.required),
      comissao: new FormControl('', Validators.required),
    });

    this.visitasForm = new FormGroup({
      id: new FormControl(null),
      observacoes: new FormControl(''),
      data: new FormControl('', Validators.required),
      itens: new FormArray<FormGroup>([])
    })
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];

      if (id) {
        this.isAlteracao = true;

        this.clienteService.carregarCliente(id).subscribe({
          next: cliente => {
            this.camposForm.patchValue(cliente);
            this.titulo = 'Editar cliente';
            this.botaoTexto = 'Salvar alterações';
            this.carregarTabelaVisitasCompletas(String(cliente.id));
          },
          error: erro => {
            console.error('Ocorreu um erro: ', erro);
          }
        });
      } else {
        this.isAlteracao = false;
      }


    });



    this.localidadeService.obterTodos().subscribe({
      next: (listaLocalidades) => {
        this.localidades = listaLocalidades.map((p: Localidade) => ({ ...p }));
      }
    });

    this.produtoService.obterTodos().subscribe({
      next: (listaProdutos) => {
        this.produtos = listaProdutos || [];
        this.produtos.forEach(p => {
          if (p.id != null) this.produtoById.set(String(p.id), p);
        });
      }
    });

  }
  salvar() {
    this.camposForm.markAllAsTouched();

    if (this.camposForm.valid) {
      if (this.isAlteracao) {
        this.clienteService.editar(this.camposForm.value).subscribe({
          next: cliente => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Cliente atualizado com sucesso!'
            });

          },
          error: erro => {
            console.error('Ocorreu um erro: ', erro)
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao atualizar o cliente.'
            });
          }
        });
      } else {
        const { id, ...novocliente } = this.camposForm.value;
        this.clienteService
          .salvar(novocliente)
          .subscribe({
            next: cliente => {
              console.log('Salva com sucesso!', cliente);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Cliente salvo com sucesso!'
              });
              this.router.navigate(
                ['/clientes/cadastro'],
                { queryParams: { id: cliente.id } }
              );
            },
            error: erro => {
              console.error('Ocorreu um erro: ', erro)
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Falha ao salvar o cliente.'
              });
            }
          });
      }
    }
  }

  isCampoInvalido(nomeCampo: string): boolean {
    const campo = this.camposForm.get(nomeCampo);
    return campo?.invalid && campo?.touched && campo?.errors?.['required']
  }

  abrirDialog(visita?: any) {
    this.dialogAberto = true;
    this.visitasForm.reset({
      id: null,
      observacoes: '',
      data: new Date()
    });
    this.itens.clear();
    this.setSomenteLeitura(false);

    const clienteId = String(this.camposForm.get('id')?.value || '');
    if (clienteId) {
      this.preencherItensComConsignado(clienteId);
    }
  }

  fecharDialog(visita?: any) {
    this.dialogAberto = false;
  }

  get itens(): FormArray<FormGroup> {
    return this.visitasForm.get('itens') as FormArray<FormGroup>;
  }

  criarItem(readonly = false): FormGroup {
    const fg = new FormGroup({
      produtoId: new FormControl<String | null>(null, Validators.required),
      possuia: new FormControl(0, Validators.min(0)),
      entregue: new FormControl(0),
      vendido: new FormControl(0),
      retirado: new FormControl(0),
      possuiAgora: new FormControl({ value: 0, disabled: true }),
      valor: new FormControl({ value: null, disabled: true })
    });

    if (readonly) {
      fg.disable({ emitEvent: false });
    }
    return fg;
  }

  addItem() {
    const item = this.criarItem(false);
    this.itens.push(item);


    item.get('produtoId')!.valueChanges.subscribe(id => {
      const produto = this.produtos.find(p => p.id === id);
      item.get('valor')!.setValue(produto ? produto.preco : null);
    });
  }

  removeItem(index: number) {
    this.itens.removeAt(index);
  }

  getItem(index: number): FormGroup {
    return this.itens.at(index) as FormGroup;
  }

  total(campo: 'possuia' | 'entregue' | 'vendido' | 'retirado' | 'possuiAgora'): number {
    return this.itens.controls.reduce((sum, g) => {
      const ctl = (g as FormGroup).get(campo);
      return sum + this.n(ctl?.value);
    }, 0);
  }

  recalc(index: number): void {
    const g = this.itens.at(index) as FormGroup;
    const possuia = this.n(g.get('possuia')?.value);
    const entregue = this.n(g.get('entregue')?.value);
    const vendido = this.n(g.get('vendido')?.value);
    const retirado = this.n(g.get('retirado')?.value);

    const agora = possuia + entregue - vendido - retirado;
    g.get('possuiAgora')?.setValue(agora, { emitEvent: false });
  }

  salvarVisita() {
    this.visitasForm.markAllAsTouched();
    if (this.visitasForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha a data e pelo menos 1 item válido.'
      });
      return;
    }

    if (this.itens.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Adicione pelo menos um produto.'
      });
      return;
    }

    const visita = {
      cliente_id: this.camposForm.get('id')?.value,
      data_visita: this.toIsoDate(this.visitasForm.get('data')?.value),
      observacoes: this.visitasForm.get('observacoes')?.value || ''
    };

    if (!visita.cliente_id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Salve o cliente antes de salvar a visita.'
      });
      return;
    }

    const itensEntrada = this.itens.controls.map(g => {
      const fg = g as FormGroup;
      const get = (name: string) => Number(fg.get(name)?.value || 0);
      const produtoId = fg.get('produtoId')?.value;

      return {
        produto_id: String(produtoId),
        possuia: Math.max(0, get('possuia')),
        entregue: Math.max(0, get('entregue')),
        vendido: Math.max(0, get('vendido')),
        retirado: Math.max(0, get('retirado'))
      };
    });

    this.visitasService.salvarCompleto(visita, itensEntrada).subscribe({
      next: ({ visitaId }) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Visita #${visitaId} salva com sucesso.`
        });
        this.dialogAberto = false;

      },
      error: (e) => {
        console.error(e);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: e?.message || 'Falha ao salvar a visita.'
        });
      }
    });
  }

  private toIsoDate(d: any): string {
    const dt = d instanceof Date ? d : new Date(d);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
  }


  private addItemFromEstoque(ec: EstoqueCliente) {
    const item = this.criarItem();

    item.get('produtoId')!.setValue(String(ec.produto_id), { emitEvent: false });

    item.get('possuia')!.setValue(Math.max(0, Number(ec.quantidade || 0)), { emitEvent: false });

    const prod = this.produtoById.get(String(ec.produto_id));
    item.get('valor')!.setValue(prod ? prod.preco : null, { emitEvent: false });

    item.get('possuiAgora')!.setValue(item.get('possuia')!.value, { emitEvent: false });

    this.itens.push(item);
  }

  private preencherItensComConsignado(clienteId: string) {
    this.estoqueClienteService.obterPorClienteComSaldo(clienteId).subscribe({
      next: (lista) => {
        if (this.itens.length === 1 && !this.itens.at(0)?.get('produtoId')?.value) {
          this.itens.removeAt(0);
        }
        lista.forEach(ec => this.addItemFromEstoque(ec));
        if (this.itens.length === 0) this.addItem();
      },
      error: () => {
      }
    });
  }

  private carregarTabelaVisitasCompletas(clienteId: string) {
    this.loadingVisitas = true;

    this.visitasService.filtrar(clienteId)
      .pipe(
        switchMap((visitas: Visita[]) => {
          if (!visitas || visitas.length === 0) {
            return of([]);
          }
          const reqs = visitas.map(v => this.visitasService.getCompleta(String(v.id)));
          return forkJoin(reqs);
        })
      )
      .subscribe({
        next: (lista: Array<{ visita: Visita; itens: VisitaItem[] }>) => {
          if (!lista || lista.length === 0) {
            this.visitasRows = [];
            this.loadingVisitas = false;
            return;
          }

          const rows: VisitaRow[] = lista.map(({ visita, itens }) => {
            const distintos = new Set(
              (itens || [])
                .map(i => String(i.produto_id))
                .filter(pid => !!pid)
            ).size;

            return {
              id: String(visita.id),
              data_visita: visita.data_visita,
              observacoes: visita.observacoes || '',
              qtdProdutosDistintos: distintos
            };
          });

          rows.sort((a, b) => (a.data_visita < b.data_visita ? 1 : -1));

          this.visitasRows = rows;
          this.loadingVisitas = false;
        },
        error: (e) => {
          console.error('Erro ao carregar visitas completas', e);
          this.loadingVisitas = false;
        }
      });
  }

  formatData(d: string) {
    return formatDate(d, 'dd/MM/yyyy', 'pt-BR', 'UTC');
  }

  abrirDetalhe(row: { id: string }) {
    if (!row?.id) return;

    this.dialogAberto = true;

    this.setSomenteLeitura(false);
    this.itens.clear();

    this.visitasService.getCompleta(String(row.id)).subscribe({
      next: ({ visita, itens }) => {
        const [y, m, d] = (visita.data_visita || '').split('-').map(Number);
        const dataLocal = !isNaN(y) ? new Date(y, (m ?? 1) - 1, d ?? 1) : new Date();

        this.visitasForm.patchValue({
          id: String(visita.id),
          observacoes: visita.observacoes || '',
          data: dataLocal
        }, { emitEvent: false });

        (itens || []).forEach(it => {
          const g = this.criarItem(true);
          g.patchValue({
            produtoId: String(it.produto_id ?? ''),
            possuia: it.possuia ?? 0,
            entregue: it.entregue ?? 0,
            vendido: it.vendido ?? 0,
            retirado: it.retirado ?? 0,
            possuiAgora: it.possui_agora ?? 0,
            valor: this.produtos.find(p => String(p.id) === String(it.produto_id))?.preco ?? null
          }, { emitEvent: false });
          this.itens.push(g);
        });

        this.setSomenteLeitura(true);
      },
      error: () => {
        this.dialogAberto = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar a visita.' });
      }
    });
  }

  private setSomenteLeitura(on: boolean) {

    if (on) {
      this.visitasForm.disable({ emitEvent: false });
      this.somenteLeitura = true

    } else {
      this.visitasForm.enable({ emitEvent: false });
      this.itens.controls.forEach(g => g.get('possuiAgora')?.disable({ emitEvent: false }));
      this.somenteLeitura = false;
    }
  }





  imprimirVisita(visitaId: string) {
    if (!visitaId) return;

    this.visitasService.getCompleta(String(visitaId)).subscribe({
      next: ({ visita, itens }) => {
        // Dados do cliente (já carregados no form)
        const cliente = this.camposForm.getRawValue(); // nome, email, endereco, etc.
        const dataBR = this.formatData(visita.data_visita);

        // Mapa de produtos para preço/nome
        const prodById = new Map<string, Produto>();
        (this.produtos || []).forEach(p => prodById.set(String(p.id), p));

        // Monta linhas e totais
        let totalGeral = 0;
        const linhas = (itens || []).map(it => {
          const prod = prodById.get(String(it.produto_id));
          const preco = prod?.preco ?? 0;
          const totalLinha = (it.vendido ?? 0) * preco;
          totalGeral += totalLinha;

          return `
          <tr>
            <td>${this._esc(prod?.nome ?? `Produto ${it.produto_id}`)}</td>
            <td class="num">${it.possuia ?? 0}</td>
            <td class="num">${it.entregue ?? 0}</td>
            <td class="num">${it.vendido ?? 0}</td>
            <td class="num">${it.retirado ?? 0}</td>
            <td class="num">${it.possui_agora ?? 0}</td>
            <td class="num">${this._moeda(preco)}</td>
            <td class="num">${this._moeda(totalLinha)}</td>
          </tr>`;
        }).join('');

        const html = this._notaHtml({
          empresa: { nome: 'BancaZapp', cnpj: '00.000.000/0000-00', endereco: 'Endereço da Empresa, 123' },
          cliente: { nome: cliente?.nome ?? '', email: cliente?.email ?? '', telefone: cliente?.telefone ?? '', endereco: cliente?.endereco ?? '', localidade: cliente?.localidade ?? '' },
          visita: { id: String(visita.id), data: dataBR, observacoes: visita.observacoes || '-' },
          linhasHtml: linhas,
          totalGeral
        });

        // Abre janela de impressão
        const win = window.open('', '', 'width=920,height=700');
        if (!win) return;
        win.document.open();
        win.document.write(html);
        win.document.close();
        // aguarda render e imprime
        win.focus();
        win.print();
        // opcional: fechar depois de imprimir
        // win.close();
      },
      error: (e) => {
        console.error(e);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao gerar a nota da visita.' });
      }
    });
  }

  // helpers

  private _moeda(v: number) {
    return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private _esc(s: string) {
    return (s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]!));
  }

  private _notaHtml(ctx: {
    empresa: { nome: string; cnpj: string; endereco: string; };
    cliente: { nome: string; email: string; telefone: string; endereco: string; localidade: string; };
    visita: { id: string; data: string; observacoes: string; };
    linhasHtml: string;
    totalGeral: number;
  }) {
    return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Nota da Visita ${this._esc(ctx.visita.id)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; }
    body { color: #222; }
    .nota { max-width: 800px; margin: 0 auto; }
    .row { display: flex; gap: 16px; }
    .col { flex: 1; }
    h1 { margin: 0 0 8px; font-size: 20px; }
    h2 { margin: 16px 0 8px; font-size: 16px; }
    .muted { color: #666; font-size: 12px; }
    .box { border: 1px solid #ddd; padding: 12px; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; }
    th { background: #f6f6f6; text-align: left; }
    .num { text-align: right; }
    .total { font-weight: bold; font-size: 14px; }
    .foot { margin-top: 16px; }
    .right { text-align: right; }
    .mb8 { margin-bottom: 8px; }
    .mb16 { margin-bottom: 16px; }
    .mb24 { margin-bottom: 24px; }
    .titulo { display:flex; justify-content:space-between; align-items:flex-start; }
    .linha { border-bottom: 1px solid #eee; margin: 8px 0 12px; }
    @media print {
      .no-print { display: none; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="nota">
    <div class="titulo">
      <div>
        <h1>${this._esc(ctx.empresa.nome)}</h1>
        <div class="muted">${this._esc(ctx.empresa.endereco)} • CNPJ: ${this._esc(ctx.empresa.cnpj)}</div>
      </div>
      <div class="right">
        <div><strong>Nota da Visita</strong> #${this._esc(ctx.visita.id)}</div>
        <div>${this._esc(ctx.visita.data)}</div>
      </div>
    </div>

    <div class="linha"></div>

    <div class="row">
      <div class="col box">
        <h2>Cliente</h2>
        <div class="mb8"><strong>${this._esc(ctx.cliente.nome)}</strong></div>
        <div class="muted">${this._esc(ctx.cliente.endereco)}</div>
        <div class="muted">${this._esc(ctx.cliente.localidade)}</div>
        <div class="muted">${this._esc(ctx.cliente.email)} • ${this._esc(ctx.cliente.telefone)}</div>
      </div>
      <div class="col box">
        <h2>Visita</h2>
        <div><strong>Data:</strong> ${this._esc(ctx.visita.data)}</div>
        <div class="mb8"><strong>Obs.:</strong> ${this._esc(ctx.visita.observacoes)}</div>
      </div>
    </div>

    <h2 class="mb8">Itens negociados</h2>
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th class="num">Possuía</th>
          <th class="num">Entregue</th>
          <th class="num">Vendido</th>
          <th class="num">Retirado</th>
          <th class="num">Saldo</th>
          <th class="num">Preço</th>
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>
        ${ctx.linhasHtml || `<tr><td colspan="8" class="muted">Sem itens</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td class="right total" colspan="7">Total Geral</td>
          <td class="num total">${this._moeda(ctx.totalGeral)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="foot muted">
      <div class="mb8">Documento gerado automaticamente pelo sistema — ${this._esc(ctx.empresa.nome)}</div>
    </div>
  </div>
</body>
</html>
`;
  }
}
