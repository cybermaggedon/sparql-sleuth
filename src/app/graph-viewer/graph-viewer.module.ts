
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog'; // Unused?
import { SidebarModule } from 'primeng/sidebar';
import { TabViewModule } from 'primeng/tabview';
import { ToolbarModule } from 'primeng/toolbar';

import { GraphViewerComponent } from './graph-viewer/graph-viewer.component';
import { GraphComponent } from './graph/graph.component';
import { ControlsComponent } from './controls/controls.component';
import { DetailComponent } from './detail/detail.component';
import { SearchComponent } from './search/search.component';
import { InfoComponent } from './info/info.component';
import { NodeDetailsComponent } from './node-details/node-details.component';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';
import { SchemaDialogComponent } from './schema-dialog/schema-dialog.component';
import { SchemaComponent } from './schema/schema.component';

@NgModule({
    declarations: [
	GraphViewerComponent,
	GraphComponent,
	ControlsComponent,
	DetailComponent,
	SearchComponent,
	InfoComponent,
        NodeDetailsComponent,
        NodeDialogComponent,
        SearchDialogComponent,
        SchemaDialogComponent,
        SchemaComponent,
    ],
    imports: [
	BrowserModule,
	FormsModule,
	ReactiveFormsModule,

	ButtonModule,
	TableModule,
	InputTextModule,
	DialogModule,
	SidebarModule,
	TabViewModule,
	ToolbarModule,

    ],
    exports: [
	GraphViewerComponent,
    ],
    providers: [],
    bootstrap: [
    ]
})
export class GraphViewerModule { }

