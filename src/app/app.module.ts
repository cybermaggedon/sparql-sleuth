import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QueryTableComponent } from './query-table/query-table.component';
import { QueryGraphComponent } from './query-graph/query-graph.component';

@NgModule({
  declarations: [
    AppComponent,
    QueryTableComponent,
    QueryGraphComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
