import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { Categoria } from '../../../models/categoria';
import { CategoriaService } from '../../../services/categoria.service';
import { ProdutoService } from '../../../services/produto.service';

@Component({
  selector: 'app-produtos-cadastro',
  standalone: true,
  templateUrl: './produtos-cadastro.component.html',
  providers: [MessageService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
  ],
})
export class ProdutosCadastroComponent implements OnInit {
  camposForm: FormGroup;
  categorias: Categoria[] = [];
  isAlteracao: boolean = false;
  titulo = 'Cadastrar produto';
  botaoTexto = 'Cadastrar';

  constructor(
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.camposForm = new FormGroup({
      id: new FormControl(null),
      nome: new FormControl('', Validators.required),
      preco: new FormControl('', Validators.required),
      categoriaId: new FormControl(null, Validators.required)
    });
  }

  ngOnInit(): void {
    this.categoriaService.obterTodos().subscribe({
      next: (listaCategorias) => {
        this.categorias = listaCategorias.map((p: Categoria) => ({ ...p }));
      }
    });

    this.route.queryParams.subscribe(params => {
      const id = params['id'];

      if (id) {
        this.isAlteracao = true;

        this.produtoService.carregarProduto(id).subscribe({
          next: produto => {
            this.camposForm.patchValue({
              id: produto.id ?? null,
              nome: produto.nome,
              preco: produto.preco,
              categoriaId: (produto as any).categoriaId ?? null
            });
            this.titulo = 'Editar produto';
            this.botaoTexto = 'Salvar alteraÇõÇæess';

          },
          error: erro => {
            console.error('Ocorreu um erro: ', erro);
          }
        });
      } else {
        this.isAlteracao = false;
      }
    });
  }
  salvar() {
    this.camposForm.markAllAsTouched();

    if (this.camposForm.valid) {
      if (this.isAlteracao) {
        this.produtoService.editar(this.camposForm.value).subscribe({
          next: produto => {
            this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto atualizado com sucesso!'
          });
          },
          error: erro => {
            console.error('Ocorreu um erro: ', erro)
            this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao atualizar o produto.'
          });
          }
        });
      } else {
        const { id, ...novoProduto } = this.camposForm.value;
        this.produtoService
          .salvar(novoProduto)
          .subscribe({
            next: produto => {
              console.log('Salva com sucesso!', produto);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Produto cadastrado com sucesso!'
              });
              this.camposForm.reset();
            },
            error: erro => {
              console.error('Ocorreu um erro: ', erro)
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Falha ao cadastrar o produto.'
              });
            }
          });
      }
    }else{
      this.messageService.add({
        severity: 'warn',
        summary: 'AtenÇõÇœo',
        detail: 'Por favor, preencha todos os campos obrigatÇürios.'
      });
    }
  }

  isCampoInvalido(nomeCampo: string): boolean {
    const campo = this.camposForm.get(nomeCampo);
    return campo?.invalid && campo?.touched && campo?.errors?.['required']
  }

  
}
