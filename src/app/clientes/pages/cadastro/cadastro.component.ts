import { Component, inject } from '@angular/core';
import { ClienteService } from '../../cliente.service';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  standalone: false,
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent {
  camposForm: FormGroup;
  snack: MatSnackBar = inject(MatSnackBar)
  isAlteracao: boolean = false;
  titulo = 'Cadastrar cliente';
  botaoTexto = 'Cadastrar';

  constructor(private clienteService: ClienteService, private route: ActivatedRoute, private router: Router) {
    this.camposForm = new FormGroup({
      id: new FormControl(null),
      nome: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      telefone: new FormControl(''),
      endereco: new FormControl(''),
      comissao: new FormControl('', Validators.required),
    });
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
            this.botaoTexto = 'Salvar alteraçõess';

          },
          error: erro => {
            console.error('Ocorreu um erro: ', erro);
            this.mostrarMensagem('Ocorreu um erro ao carregar o cliente.');
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
        this.clienteService.editar(this.camposForm.value).subscribe({
          next: cliente => {
            this.mostrarMensagem('cliente editado com sucesso!')
          },
          error: erro => {
            console.error('Ocorreu um erro: ', erro)
            this.mostrarMensagem('Ocorreu um erro ao editar o cliente.')
          }
        });
      } else {
        const { id, ...novocliente } = this.camposForm.value;
        this.clienteService
          .salvar(novocliente)
          .subscribe({
            next: cliente => {
              console.log('Salva com sucesso!', cliente);
              this.router.navigate(
                ['/paginas/clientes/cadastro'],
                { queryParams: { id: cliente.id } }
              );
              this.mostrarMensagem('cliente criado com sucesso!')
            },
            error: erro => {
              console.error('Ocorreu um erro: ', erro)
              this.mostrarMensagem('Ocorreu um erro ao criar o cliente.')
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
