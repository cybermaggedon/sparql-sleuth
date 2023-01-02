
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GraphViewerModule } from './graph-viewer/graph-viewer.module';
import { QueryEditorModule } from './query-editor/query-editor.module';
import { TableViewerModule } from './table-viewer/table-viewer.module';

import { ToastComponent } from './toast/toast.component';

@NgModule({
    declarations: [
	AppComponent,
	ToastComponent,
    ],
    imports: [
	BrowserModule,
	AppRoutingModule,
	BrowserAnimationsModule,
	HttpClientModule,

	ProgressSpinnerModule,
	ToastModule,
	ButtonModule,

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

