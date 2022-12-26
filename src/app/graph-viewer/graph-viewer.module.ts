
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

import { GraphViewerComponent } from './graph-viewer/graph-viewer.component';
import { GraphComponent } from './graph/graph.component';
import { ControlsComponent } from './controls/controls.component';
import { DetailComponent } from './detail/detail.component';
import { SearchComponent } from './search/search.component';
import { InfoComponent } from './info/info.component';

@NgModule({
    declarations: [
	GraphViewerComponent,
	GraphComponent,
	ControlsComponent,
	DetailComponent,
	SearchComponent,
	InfoComponent,
    ],
    imports: [
	BrowserModule,
	ButtonModule,
	TableModule,
	InputTextModule,
	FormsModule,
	ReactiveFormsModule,
    ],
    exports: [
	GraphViewerComponent,
    ],
    providers: [],
    bootstrap: [
    ]
})
export class GraphViewerModule { }

