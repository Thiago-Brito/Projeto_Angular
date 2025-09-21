import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ProdutosRoutingModule } from './produtos-routing.module';
import { ManterComponent } from './pages/manter/manter.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms'
import { provideEnvironmentNgxCurrency} from "ngx-currency";
import { NgxCurrencyDirective } from 'ngx-currency';


export const customCurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  allowZero: true,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: ".",
};

@NgModule({
  declarations: [
    ManterComponent,
    CadastroComponent
  ],
  imports: [
    CommonModule,
    ProdutosRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgxCurrencyDirective
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideEnvironmentNgxCurrency(customCurrencyMaskConfig),
  ]

})
export class ProdutosModule { }
