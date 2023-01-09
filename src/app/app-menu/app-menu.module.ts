
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

import { MenuComponent } from './menu/menu.component';

@NgModule({
    declarations: [
	MenuComponent,
    ],
    imports: [
        CommonModule,
	MenuModule,
	ButtonModule,
    ],
    exports: [
        MenuComponent,
    ],
})
export class AppMenuModule { }

