import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  providers:[MessageService],
  imports: [CommonModule,CardModule,ButtonModule,InputTextModule,PasswordModule,IftaLabelModule,ReactiveFormsModule,ToastModule],
  templateUrl: './login.component.html',
  styles: ``
})
export class LoginComponent {

  camposForm: FormGroup;


    constructor(
    private auth: AuthService,
    private router: Router,
    private msg: MessageService
  ) {
     this.camposForm = new FormGroup({
        login : new FormControl('',Validators.required),
        senha : new FormControl('',Validators.required)
     })
  }

  entrar() {
    if (this.camposForm.invalid) { this.camposForm.markAllAsTouched(); return; }
    const { login, senha } = this.camposForm.value as any;
    this.auth.login(login, senha).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => this.msg.add({ severity: 'error', summary: 'Falha no login', detail: 'Credenciais inválidas' })
    });
  }

    isCampoInvalido(nomeCampo: string): boolean {
    const campo = this.camposForm.get(nomeCampo);
    return campo?.invalid && campo?.touched && campo?.errors?.['required']
  }
}
