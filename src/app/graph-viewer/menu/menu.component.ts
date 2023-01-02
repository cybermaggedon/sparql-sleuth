import { Component, OnInit } from '@angular/core';

import { MenuItem } from 'primeng/api';

import { CommandService } from '../../command.service';

@Component({
    selector: 'menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

    menuItems : MenuItem[] = [
	{
	    label: "Graph",
	    icon: "pi pi-graph",
	    items: [
		{
		    label: "Search",
		    icon: "pi pi-search",
		    command: () => { this.command.beginSearch(); }
		},
		{
		    label: "Schema",
		    icon: "pi pi-list",
		    command: () => { this.command.schema(); }
		},
		{
		    label: "Datasets",
		    icon: "pi pi-book",
		    command: () => { this.command.datasets(); }
		}
	    ]
	},
	{
	    label: "Info",
	    items: [
		{
		    label: "Getting started",
		    icon: "pi pi-question-circle",
		    command: () => { this.command.info(); }
		},
		{
		    label: "About...",
		    icon: "pi pi-info-circle",
		    command: () => { this.command.about(); }
		},
		{
		    label: "Serialise",
		    icon: "pi pi-",
		    command: () => { this.command.serialise(); }
		}
	    ]
	}
    ];

    constructor(
	private command : CommandService,
    ) { }

    ngOnInit(): void {
    }

}
