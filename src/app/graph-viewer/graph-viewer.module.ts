
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { GraphViewerComponent } from './graph-viewer/graph-viewer.component';
import { GraphComponent } from './graph/graph.component';
import { ControlsComponent } from './controls/controls.component';

@NgModule({
    declarations: [
	GraphViewerComponent,
	GraphComponent,
 ControlsComponent,
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
