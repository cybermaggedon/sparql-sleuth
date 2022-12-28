
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GraphViewerModule } from './graph-viewer/graph-viewer.module';
import { QueryEditorModule } from './query-editor/query-editor.module';
import { TableViewerModule } from './table-viewer/table-viewer.module';

@NgModule({
    declarations: [
	AppComponent,
    ],
    imports: [
	BrowserModule,
	AppRoutingModule,
	BrowserAnimationsModule,
	DragDropModule,
	HttpClientModule,
	GraphViewerModule,
	QueryEditorModule,
	TableViewerModule,
    ],
    providers: [],
    bootstrap: [
	AppComponent
    ]
})
export class AppModule { }

