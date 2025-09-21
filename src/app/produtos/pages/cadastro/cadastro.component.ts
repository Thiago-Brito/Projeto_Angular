import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { ProdutoService } from '../../services/produto.service';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  standalone: false,
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent implements OnInit {
  camposForm: FormGroup;
  categorias: Categoria[] = [];
  snack: MatSnackBar = inject(MatSnackBar)
  isAlteracao: boolean = false;
  titulo = 'Cadastrar produto';
  botaoTexto = 'Cadastrar';

  constructor(private produtoService: ProdutoService, private categoriaService: CategoriaService, private route: ActivatedRoute) {
    this.camposForm = new FormGroup({
      id: new FormControl(null),
      nome: new FormControl('', Validators.required),
      preco: new FormControl('', Validators.required),
      categoria: new FormControl('', Validators.required)
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
            this.camposForm.patchValue(produto);
            this.titulo = 'Editar produto';
            this.botaoTexto = 'Salvar alteraçõess';

          },
          error: erro => {
            console.error('Ocorreu um erro: ', erro);
            this.mostrarMensagem('Ocorreu um erro ao carregar o produto.');
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
            this.mostrarMensagem('Produto editado com sucesso!')
          },
          error: erro => {
            console.error('Ocorreu um erro: ', erro)
            this.mostrarMensagem('Ocorreu um erro ao editar o produto.')
          }
        });
      } else {
        this.produtoService
          .salvar(this.camposForm.value)
          .subscribe({
            next: produto => {
              console.log('Salva com sucesso!', produto);
              this.camposForm.reset();
              this.mostrarMensagem('Produto criado com sucesso!')
            },
            error: erro => {
              console.error('Ocorreu um erro: ', erro)
              this.mostrarMensagem('Ocorreu um erro ao criar o produto.')
            }
          });
      }
    }
  }

  isCampoInvalido(nomeCampo: string): boolean {
    const campo = this.camposForm.get(nomeCampo);
    return campo?.invalid && campo?.touched && campo?.errors?.['required']
  }

  mostrarMensagem(mensagem: string) {
    this.snack.open(mensagem, "Ok")
  }
}
