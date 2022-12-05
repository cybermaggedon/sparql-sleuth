import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QueryGraphComponent } from './query-graph/query-graph.component';

const routes: Routes = [
    { path: 'graph', component: QueryGraphComponent },
    { path: '', redirectTo: '/graph', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

