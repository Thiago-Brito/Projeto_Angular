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
import { Visita, VisitaPayload, VisitaTipo } from '../../../models/visita';
import { VisitaItem, VisitaItemLegacy } from '../../../models/visita-item';
import { VisitaItemService } from '../../../services/visita-item.service';
import { forkJoin, of, switchMap } from 'rxjs';


type VisitaRow = {
  id: string;
  dataVisita: string;
  tipo: string;
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
  tituloDialog = "Nova visita"
  tituloDialogVenda = 'Nova venda';
  tituloDialogEstoque = 'Entrega / Devolução';
  produtos: Produto[] = [];
  private produtoById = new Map<String, Produto>();

  visitasRows: VisitaRow[] = [];
  loadingVisitas = false;
  estoqueClienteRows: Array<{ produtoId: string; produtoNome: string; quantidade: number; preco: number; total: number }> = [];
  loadingEstoqueCliente = false;

  somenteLeitura = false;



  dialogVendaAberto = false;
  dialogEstoqueAberto = false;
  dialogDetalheAberto = false;
  dialogEstoqueClienteAberto = false;
  editando = false;
  private estoqueByProdutoId = new Map<string, number>();



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
      localidadeId: new FormControl(null, Validators.required),
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
            this.camposForm.patchValue({
              id: cliente.id ?? null,
              nome: cliente.nome,
              email: cliente.email,
              telefone: cliente.telefone,
              endereco: cliente.endereco,
              localidadeId: (cliente as any).localidadeId ?? null,
              comissao: cliente.comissao
            });
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
    const campoNome = nomeCampo === 'localidade' ? 'localidadeId' : nomeCampo;
    const campo = this.camposForm.get(campoNome);
    return campo?.invalid && campo?.touched && campo?.errors?.['required']
  }

  abrirDialogVenda() {
    this.prepararDialog('venda');
  }

  abrirDialogEstoque() {
    this.prepararDialog('estoque');
  }

  private prepararDialog(tipo: 'venda' | 'estoque') {
    this.dialogVendaAberto = tipo === 'venda';
    this.dialogEstoqueAberto = tipo === 'estoque';
    this.dialogDetalheAberto = false;

    if (tipo === 'venda') {
      this.tituloDialogVenda = 'Nova venda';
    } else {
      this.tituloDialogEstoque = 'Entrega / Devolução';
    }

    this.visitasForm.reset({
      id: null,
      observacoes: '',
      data: new Date()
    });
    this.itens.clear();
    this.setSomenteLeitura(false);

    const clienteId = String(this.camposForm.get('id')?.value || '');
    if (clienteId) {
      if (tipo === 'estoque') {
        this.carregarEstoqueCliente(clienteId, true, 'estoque');
      } else {
        this.carregarEstoqueCliente(clienteId, true, 'venda');
      }
    } else if (tipo === 'estoque') {
      this.addItemEstoque();
    } else {
      this.addItemVenda();
    }
  }

  fecharDialogVenda() {
    this.dialogVendaAberto = false;
  }

  fecharDialogEstoque() {
    this.dialogEstoqueAberto = false;
  }

  fecharDialogDetalhe() {
    this.dialogDetalheAberto = false;
  }

  abrirDialogEstoqueCliente() {
    const clienteId = String(this.camposForm.get('id')?.value || '');
    if (!clienteId) return;
    this.dialogEstoqueClienteAberto = true;
    this.carregarEstoqueClienteAtual(clienteId);
  }

  fecharDialogEstoqueCliente() {
    this.dialogEstoqueClienteAberto = false;
  }

  get itens(): FormArray<FormGroup> {
    return this.visitasForm.get('itens') as FormArray<FormGroup>;
  }

  criarItem(readonly = false): FormGroup {
    const fg = new FormGroup({
      produtoId: new FormControl<number | null>(null, Validators.required),
      possuia: new FormControl(0, Validators.min(0)),
      entregue: new FormControl(0),
      vendido: new FormControl(0),
      retirado: new FormControl(0),
      possuiAgora: new FormControl({ value: 0, disabled: true }),
      preco:      new FormControl({ value: 0,  disabled: true }),
      valorBruto: new FormControl({ value: 0,  disabled: true }),
      desconto:   new FormControl({ value: 0,  disabled: true }),
      valorPagar: new FormControl({ value: 0,  disabled: true }),
    });

    if (readonly) {
      fg.disable({ emitEvent: false });
    }
    return fg;
  }
  private addItemBase(modo: 'venda' | 'estoque') {
    const item = this.criarItem(false);
    if (modo === 'venda') {
      item.get('entregue')!.setValue(0, { emitEvent: false });
      item.get('retirado')!.setValue(0, { emitEvent: false });
    } else {
      item.get('vendido')!.setValue(0, { emitEvent: false });
    }

    this.itens.push(item);
    const idx = this.itens.length - 1;

    item.get('produtoId')!.valueChanges.subscribe(id => {
      const prod = this.produtos.find(p => Number(p.id) === Number(id));
      item.get('preco')!.setValue(prod ? prod.preco : 0, { emitEvent: false });

      const possuia = this.estoqueByProdutoId.get(String(id)) ?? 0;
      item.get('possuia')!.setValue(possuia, { emitEvent: false });

      this.recalc(idx);
    });

    this.recalc(idx);
  }

  addItemVenda() {
    this.addItemBase('venda');
  }

  addItemEstoque() {
    this.addItemBase('estoque');
  }

  removeItem(index: number) {
    this.itens.removeAt(index);
  }

  getItem(index: number): FormGroup {
    return this.itens.at(index) as FormGroup;
  }

 total(campo: 'possuia' | 'entregue' | 'vendido' | 'retirado' | 'possuiAgora' | 'valorBruto' | 'desconto' | 'valorPagar'): number {
  return this.itens.controls
    .map((c: any) => Number(c.get(campo)?.value) || 0)
    .reduce((a: number, b: number) => a + b, 0);
  }

 recalc(i: number): void {
  const fg = this.getItem(i);
  const possuia  = Number(fg.get('possuia')?.value)  || 0;
  const entregue = Number(fg.get('entregue')?.value) || 0;
  const vendido  = Number(fg.get('vendido')?.value)  || 0;
  const retirado = Number(fg.get('retirado')?.value) || 0;

  const possuiAgora = Math.max(0, possuia + entregue - vendido - retirado);
  fg.get('possuiAgora')?.setValue(possuiAgora, { emitEvent: false });

  const preco = Number(fg.get('preco')?.value) || 0;
  const valorBruto = vendido * preco;

  const comissaoPct = (Number(this.camposForm.get('comissao')?.value) || 0) / 100;
  const desconto = valorBruto * comissaoPct;
  const valorPagar = valorBruto - desconto;

  fg.get('valorBruto')?.setValue(valorBruto, { emitEvent: false });
  fg.get('desconto')?.setValue(desconto, { emitEvent: false });
  fg.get('valorPagar')?.setValue(valorPagar, { emitEvent: false });
}

  salvarVenda() {
    this.salvarVisita('venda');
  }

  salvarEstoque() {
    this.salvarVisita('estoque');
  }

  private salvarVisita(tipo: 'venda' | 'estoque') {
    this.visitasForm.markAllAsTouched();
    if (this.visitasForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aten????o',
        detail: 'Preencha a data e pelo menos 1 item v??lido.'
      });
      return;
    }

    if (this.itens.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aten????o',
        detail: 'Adicione pelo menos um produto.'
      });
      return;
    }

    const clienteId = this.camposForm.get('id')?.value;
    const dataVisita = this.toIsoDate(this.visitasForm.get('data')?.value);
    const observacoes = this.visitasForm.get('observacoes')?.value || '';
    const tipoVisita: VisitaTipo = tipo === 'venda' ? 'VENDA' : 'ENTREGA_DEVOLUCAO';

    if (!clienteId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aten????o',
        detail: 'Salve o cliente antes de salvar a visita.'
      });
      return;
    }

    const itensEntrada = this.itens.controls.map(g => {
      const fg = g as FormGroup;
      const get = (name: string) => Number(fg.get(name)?.value || 0);
      const produtoId = fg.get('produtoId')?.value;

      return {
        produtoId: String(produtoId),
        possuia: Math.max(0, get('possuia')),
        entregue: tipo === 'estoque' ? Math.max(0, get('entregue')) : 0,
        vendido: tipo === 'venda' ? Math.max(0, get('vendido')) : 0,
        retirado: tipo === 'estoque' ? Math.max(0, get('retirado')) : 0
      };
    });

    const itensFiltrados =
      tipo === 'venda'
        ? itensEntrada.filter(i => i.vendido > 0)
        : itensEntrada.filter(i => i.entregue > 0 || i.retirado > 0);

    if (itensFiltrados.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aten????o',
        detail: tipo === 'venda'
          ? 'Informe ao menos um produto vendido.'
          : 'Informe ao menos uma entrega ou devolu????o.'
      });
      return;
    }

    const payload: VisitaPayload = {
      clienteId: String(clienteId),
      dataVisita,
      tipo: tipoVisita,
      observacoes,
      itens: itensFiltrados
    };

    this.visitasService.salvarCompleto(payload).subscribe({
      next: ({ visitaId }) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Visita #${visitaId} salva com sucesso.`
        });
        this.dialogVendaAberto = false;
        this.dialogEstoqueAberto = false;

        this.carregarTabelaVisitasCompletas(String(clienteId));
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

    item.get('produtoId')!.setValue(Number(ec.produtoId), { emitEvent: false });

    item.get('possuia')!.setValue(Math.max(0, Number(ec.quantidade || 0)), { emitEvent: false });

    const prod = this.produtoById.get(String(ec.produtoId));
    item.get('preco')!.setValue(prod ? prod.preco : null, { emitEvent: false });

    item.get('possuiAgora')!.setValue(item.get('possuia')!.value, { emitEvent: false });

    this.itens.push(item);
  }

  private carregarEstoqueCliente(
    clienteId: string,
    preencherItens: boolean,
    modo: 'venda' | 'estoque'
  ) {
    this.estoqueClienteService.obterPorClienteComSaldo(clienteId).subscribe({
      next: (lista) => {
        this.estoqueByProdutoId.clear();
        (lista || []).forEach(ec => {
          this.estoqueByProdutoId.set(String(ec.produtoId), Number(ec.quantidade || 0));
        });

        if (!preencherItens) return;

        const listaFiltrada = (lista || []).filter(ec =>
          modo !== 'venda' || Number(ec.quantidade || 0) > 0
        );

        if (this.itens.length === 1 && !this.itens.at(0)?.get('produtoId')?.value) {
          this.itens.removeAt(0);
        }
        listaFiltrada.forEach(ec => this.addItemFromEstoque(ec));
        if (this.itens.length === 0) {
          if (modo === 'estoque') {
            this.addItemEstoque();
          } else {
            this.addItemVenda();
          }
        }
      },
      error: () => {
      }
    });
  }

  private carregarEstoqueClienteAtual(clienteId: string) {
    this.loadingEstoqueCliente = true;
    this.estoqueClienteService.obterPorClienteComSaldo(clienteId).subscribe({
      next: (lista) => {
        const rows = (lista || [])
          .filter(ec => Number(ec.quantidade || 0) > 0)
          .map(ec => {
            const prod = this.produtoById.get(String(ec.produtoId));
            const preco = prod?.preco ?? 0;
            const quantidade = Number(ec.quantidade || 0);
            return {
              produtoId: String(ec.produtoId),
              produtoNome: prod?.nome ?? `Produto ${ec.produtoId}`,
              quantidade,
              preco,
              total: quantidade * preco
            };
          });
        this.estoqueClienteRows = rows;
        this.loadingEstoqueCliente = false;
      },
      error: () => {
        this.estoqueClienteRows = [];
        this.loadingEstoqueCliente = false;
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
          const reqs = visitas.map(v => {
            if (v.itens && v.itens.length > 0) {
              return of({ visita: v, itens: v.itens });
            }
            return this.visitasService.getCompleta(String(v.id));
          });
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
                .map(i => this.getItemProdutoId(i as VisitaItem & VisitaItemLegacy))
                .filter(pid => !!pid)
            ).size;

            return {
              id: String(visita.id),
              dataVisita: this.getVisitaData(visita),
              tipo: this.getVisitaTipoLabel(visita.tipo),
              observacoes: visita.observacoes || '',
              qtdProdutosDistintos: distintos
            };
          });

          rows.sort((a, b) => (a.dataVisita < b.dataVisita ? 1 : -1));

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

    this.dialogVendaAberto = false;
    this.dialogEstoqueAberto = false;
    this.dialogDetalheAberto = false;

    this.setSomenteLeitura(false);
    this.itens.clear();

    this.visitasService.getCompleta(String(row.id)).subscribe({
      next: ({ visita, itens }) => {
        const isEstoque = visita.tipo === 'ENTREGA_DEVOLUCAO';
        const dataVisita = this.getVisitaData(visita);
        const [y, m, d] = (dataVisita || '').split('-').map(Number);
        const dataLocal = !isNaN(y) ? new Date(y, (m ?? 1) - 1, d ?? 1) : new Date();

        if (isEstoque) {
          this.dialogEstoqueAberto = true;
          this.tituloDialogEstoque = `Entrega / Devolução ${this.formatData(dataVisita)}`;
        } else {
          this.dialogVendaAberto = true;
          this.tituloDialogVenda = `Venda ${this.formatData(dataVisita)}`;
        }

        this.visitasForm.patchValue({
          id: String(visita.id),
          observacoes: visita.observacoes || '',
          data: dataLocal
        }, { emitEvent: false });

        (itens || []).forEach(it => {
          const produtoId = Number(this.getItemProdutoId(it as VisitaItem & VisitaItemLegacy));
          const g = this.criarItem(true);
          g.patchValue({
            produtoId: produtoId,
            possuia: this.getItemPossuia(it),
            entregue: it.entregue ?? 0,
            vendido: it.vendido ?? 0,
            retirado: it.retirado ?? 0,
            possuiAgora: this.getItemPossuiAgora(it as VisitaItem & VisitaItemLegacy),
            preco: this.produtos.find(p => Number(p.id) === Number(produtoId))?.preco ?? null
          }, { emitEvent: false });
          this.itens.push(g);
          this.recalc(this.itens.length - 1);
        });

        this.setSomenteLeitura(true);
      },
      error: () => {
        this.dialogVendaAberto = false;
        this.dialogEstoqueAberto = false;
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

  private getLocalidadeNome(id: string | number | null | undefined): string {
    if (id == null) return '';
    const loc = this.localidades.find(l => String(l.id) === String(id));
    return loc?.nome ?? '';
  }

  private getVisitaData(visita: Visita): string {
    return visita.dataVisita || visita.data_visita || '';
  }

  private getVisitaTipoLabel(tipo?: VisitaTipo): string {
    if (!tipo) return '';
    return tipo === 'ENTREGA_DEVOLUCAO' ? 'ENTREGA / DEVOLUCAO' : 'VENDA';
  }

  private getItemProdutoId(it: VisitaItem & VisitaItemLegacy): string {
    return String(it.produtoId ?? it.produto_id ?? '');
  }

  private getItemPossuia(it: VisitaItem): number {
    return Number(it.possuia ?? it.possua ?? 0);
  }

  private getItemPossuiAgora(it: VisitaItem & VisitaItemLegacy): number {
    return Number(it.possuiAgora ?? it.possui_agora ?? 0);
  }




  imprimirVisita(visitaId: string) {
    if (!visitaId) return;

    this.visitasService.getNotaConferencia(String(visitaId)).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (!win) {
          const link = document.createElement('a');
          link.href = url;
          link.download = `nota-conferencia-${visitaId}.pdf`;
          link.click();
        }
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: (e) => {
        console.error(e);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao gerar a nota da visita.' });
      }
    });
  }

}
