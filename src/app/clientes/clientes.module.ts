import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ClientesRoutingModule } from './clientes-routing.module';
import { ManterComponent } from './pages/manter/manter.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import {MatTabsModule} from '@angular/material/tabs';


@NgModule({
  declarations: [
    ManterComponent,
    CadastroComponent
  ],
  imports: [
    CommonModule,
    ClientesRoutingModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatIcon,
    ReactiveFormsModule,
    MatTabsModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
  ]
})
export class ClientesModule { }
