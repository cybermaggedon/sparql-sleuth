
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog'; // Unused?
import { TabViewModule } from 'primeng/tabview';
import { ToolbarModule } from 'primeng/toolbar';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { MenuModule } from 'primeng/menu';

import { GraphViewerComponent } from './graph-viewer/graph-viewer.component';
import { GraphComponent } from './graph/graph.component';
import { DetailComponent } from './detail/detail.component';
import { SearchComponent } from './search/search.component';
import { InfoComponent } from './info/info.component';
import { NodeDetailsComponent } from './node-details/node-details.component';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';
import { SchemaDialogComponent } from './schema-dialog/schema-dialog.component';
import { SchemaComponent } from './schema/schema.component';
import { DatasetDialogComponent } from './dataset-dialog/dataset-dialog.component';
import { DatasetComponent } from './dataset/dataset.component';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { ToastModule } from 'primeng/toast';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';

@NgModule({
    declarations: [
	GraphViewerComponent,
	GraphComponent,
	DetailComponent,
	SearchComponent,
	InfoComponent,
        NodeDetailsComponent,
        NodeDialogComponent,
        SearchDialogComponent,
        SchemaDialogComponent,
        SchemaComponent,
        DatasetDialogComponent,
        DatasetComponent,
        InfoDialogComponent,
        AboutDialogComponent,
    ],
    imports: [

	BrowserModule,
	FormsModule,
	ReactiveFormsModule,

	ButtonModule,
	TableModule,
	InputTextModule,
	DialogModule,
	TabViewModule,
	ToolbarModule,
	PanelModule,
	CardModule,
	ImageModule,
	MenuModule,
	TagModule,
	ToastModule,

    ],
    exports: [
	GraphViewerComponent,
    ],
    providers: [],
    bootstrap: [
    ]
})
export class GraphViewerModule { }

