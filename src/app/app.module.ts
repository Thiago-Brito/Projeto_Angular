import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getPtBrPaginatorIntl } from '../getPtBrPaginatorIntl';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
   providers: [
    provideHttpClient(withFetch()),
    { provide: MatPaginatorIntl, useValue: getPtBrPaginatorIntl() } 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
