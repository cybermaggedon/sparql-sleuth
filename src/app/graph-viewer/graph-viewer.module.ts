
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { GraphViewerComponent } from './graph-viewer/graph-viewer.component';
import { GraphComponent } from './graph/graph.component';
import { ControlsComponent } from './controls/controls.component';
import { DetailComponent } from './detail/detail.component';
import { SearchComponent } from './search/search.component';

@NgModule({
    declarations: [
	GraphViewerComponent,
	GraphComponent,
	ControlsComponent,
	DetailComponent,
	SearchComponent,
    ],
    imports: [
	BrowserModule,
    ],
    exports: [
	GraphViewerComponent,
    ],
    providers: [],
    bootstrap: [
    ]
})
export class GraphViewerModule { }

