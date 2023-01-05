import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
		    command: () => this.router.navigate(
			["/graph"],
			{ queryParams: {
			    "search": "yes",
			    "announce": "no",
			} }
		    )
		},
		{
		    label: "Schema",
		    icon: "pi pi-list",
		    command: () => this.router.navigate(
			["/graph"],
			{ queryParams: {
			    "schema": "yes",
			    "announce": "no",
			} }
		    )
		},
		{
		    label: "Datasets",
		    icon: "pi pi-book",
		    command: () => this.router.navigate(
			["/graph"],
			{ queryParams: {
			    "datasets": "yes",
			    "announce": "no",
			} }
		    )
		},
		{
		    label: "Gallery",
		    icon: "pi pi-images",
		    command: () => this.router.navigate(
			["/graph"],
			{ queryParams: {
			    "gallery": "yes",
			    "announce": "no",
			} }
		    )
		},
		{
		    label: "Reset",
		    icon: "pi pi-images",
		    command: () => {
			this.command.reset();
			this.router.navigate(
			    ["/graph"],
			    { queryParams: {
			    } }
			)
		    }
		},
	    ],
	},
	{
	    label: "Sharing",
	    items: [
		{
		    label: "Export",
		    icon: "pi pi-file-export",
		    command: () => this.router.navigate(
			["/graph"],
			{ queryParams: {
			    "export": "yes",
			    "announce": "no",
			} }
		    )
		},
		{
		    label: "Import",
		    icon: "pi pi-file-import",
		    command: () => this.router.navigate(
			["/graph"],
			{ queryParams: {
			    "import": "yes",
			    "announce": "no",
			} }
		    )
		}
	    ]
	},
	{
	    label: "Info",
	    items: [
		{
		    label: "Getting started",
		    icon: "pi pi-question-circle",
		    command: () => this.router.navigate(
			["/graph"],
			{ queryParams: {
			    "info": "yes",
			    "announce": "no",
			} }
		    )
		},
		{
		    label: "About...",
		    icon: "pi pi-info-circle",
		    command: () => this.router.navigate(
			["/graph"],
			{ queryParams: {
			    "about": "yes",
			    "announce": "no",
			} }
		    )
		},
	    ]
	}
    ];

    constructor(
	private command : CommandService,
	private router : Router,
    ) { }

    ngOnInit(): void {
    }

}
