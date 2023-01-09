import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { TableViewerComponent } from './table-viewer/table-viewer.component';

@NgModule({
    declarations: [
	TableViewerComponent,
    ],
    imports: [
	BrowserModule,
	ButtonModule,
	TableModule,
	InputTextModule,
	InputTextareaModule,
	FormsModule,
	ReactiveFormsModule,
    ]
})
export class TableViewerModule { }
