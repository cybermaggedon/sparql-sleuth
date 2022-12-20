
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { GraphViewerComponent } from './graph-viewer/graph-viewer.component';
import { GraphComponent } from './graph/graph.component';

@NgModule({
    declarations: [
	GraphViewerComponent,
	GraphComponent,
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
