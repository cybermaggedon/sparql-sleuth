import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GraphViewerModule } from './graph-viewer/graph-viewer.module';

import { GraphViewerComponent
       } from './graph-viewer/graph-viewer/graph-viewer.component';

import { QueryEditorComponent
       } from './query-editor/query-editor/query-editor.component';

import { TableViewerComponent
       } from './table-viewer/table-viewer/table-viewer.component';

const routes: Routes = [
    { path: 'graph', component: GraphViewerComponent },
    { path: 'editor', component: QueryEditorComponent },
    { path: 'table', component: TableViewerComponent },
    { path: '', redirectTo: '/graph', pathMatch: 'full' },
];

@NgModule({
    imports: [
	RouterModule.forRoot(routes),
	GraphViewerModule,
    ],
    exports: [
	RouterModule
    ]
})

export class AppRoutingModule { }

