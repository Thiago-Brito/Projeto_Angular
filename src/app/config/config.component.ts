import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { UserService } from '../services/user.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';

@Component({
  selector: 'app-config',
  imports: [
    AccordionModule, 
    CardModule,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    InputMaskModule,
    ButtonModule,
  ],
  templateUrl: './config.component.html',
  styles: ``
})
export class ConfigComponent {
   userForm: FormGroup;

  constructor(private userService : UserService, private authService: AuthService){
    this.userForm = new FormGroup({
      id: new FormControl(null),
      nome: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      login: new FormControl(''),
      senha: new FormControl(''),
      cnpj: new FormControl('', Validators.required),
    });
  }

   ngOnInit(): void {
    const user: User | null = this.authService.getUsuarioLogado();
      if (user) {
        this.userService.carregarUser(user.id).subscribe({
          next: user =>{
            this.userForm.patchValue(user);
          }
        })
      }
   }



  isCampoInvalido(nomeCampo: string, form: FormGroup): boolean {
    const campo = form.get(nomeCampo);
    return campo?.invalid && campo?.touched && campo?.errors?.['required'];
  }

  salvar(){

  }
}
