
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';

import { MenuItem, MessageService } from 'primeng/api';

import { Uri } from '../../rdf/triple';
import { Node, Relationship } from '../../graph/graph';

import { RelationshipService } from '../../graph/relationship.service';
import { CommandService } from '../../command.service';
import { PropertiesService, Properties } from '../../graph/properties.service';
import { EventService } from '../../graph/event.service';

// Which dialog is open.  Can only be 1 at once.
enum DialogState {
    NONE,
    NODE,
    SEARCH,
    SCHEMA,
    INFO,
    DATASETS,
    ABOUT,
};

@Component({
    selector: 'graph-viewer',
    templateUrl: './graph-viewer.component.html',
    styleUrls: ['./graph-viewer.component.scss'],
    providers: [MessageService],
})
export class GraphViewerComponent implements OnInit {

    constructor(
	private command : CommandService,
	private route : ActivatedRoute,
	private propertyService : PropertiesService,
	private events : EventService,
	private relationship : RelationshipService,
	private messageService : MessageService,
    ) {
	
    }

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
		}
	    ]
	}
    ];

    state : DialogState = DialogState.NONE;

    properties : Properties = new Properties();

    // FIXME: quad-state type needed.
    get nodeDialogVisible() { return this.state == DialogState.NODE; }
    get searchDialogVisible() { return this.state == DialogState.SEARCH; }
    get schemaDialogVisible() { return this.state == DialogState.SCHEMA; }
    get infoDialogVisible() { return this.state == DialogState.INFO; }
    get datasetsDialogVisible() { return this.state == DialogState.DATASETS; }
    get aboutDialogVisible() { return this.state == DialogState.ABOUT; }

    selection? : Node;

    relationships : Relationship[] = [];

    ngOnInit() : void {

	this.events.nodeSelectedEvents().subscribe(
	    ev => {

		this.selection = ev.node;

		this.relationships = [];

		this.relationship.getRelationships(ev.node).subscribe(
		    ev => { this.relationships = ev; }
		);

	    }
	    
	);

	this.events.nodeDeselectedEvents().subscribe(
	    ev => {
		if (this.state == DialogState.NODE)
		    this.state = DialogState.NONE;
	    }
	    
	);

	this.propertyService.propertiesEvents().subscribe(
            ev => {
		this.properties = ev;
		this.state = DialogState.NODE;
            }
	);

	this.command.beginSearchEvents().subscribe(
	    () => this.state = DialogState.SEARCH
	);

	this.command.schemaEvents().subscribe(
	    () => this.state = DialogState.SCHEMA
	);

	this.command.datasetsEvents().subscribe(
	    () => this.state = DialogState.DATASETS
	);

	this.command.infoEvents().subscribe(
	    () => this.state = DialogState.INFO
	);

	this.command.aboutEvents().subscribe(
	    () => this.state = DialogState.ABOUT
	);

    }

    info() {
	this.command.info();
    }

    closeNodeDialog() {
	if (this.state == DialogState.NODE) {
	    this.state = DialogState.NONE;
	    this.events.unselect();
	}
    }

    closeSearchDialog() {
	if (this.state == DialogState.SEARCH) {
	    this.state = DialogState.NONE;
	    this.events.unselect();
	}
    }

    closeSchemaDialog() {
	if (this.state == DialogState.SCHEMA)
	    this.state = DialogState.NONE;
    }

    closeDatasetsDialog() {
	if (this.state == DialogState.DATASETS)
	    this.state = DialogState.NONE;
    }

    closeAboutDialog() {
	if (this.state == DialogState.ABOUT)
	    this.state = DialogState.NONE;
    }

    closeInfoDialog() {
	if (this.state == DialogState.INFO)
	    this.state = DialogState.NONE;
    }

    ngAfterViewInit(): void {

	this.route.queryParams.subscribe(

	    params => {

		if (params["node"]) {

		    // Perhaps recentre should be a different event.

		    const id = params["node"];

		    let relationships = "no";
		    
		    if (params["relationships"]) {
			relationships = params["relationships"];
		    }

		    if (id) {
			timer(1).subscribe(
			    () => {
				this.events.recentre(
				    new Uri(id),
				    relationships
				);
			    }
			);
		    }

		} else {

		    // Do nothing if node not specified.

		}

	    }
	);

	timer(1).subscribe(
	    ()=> {
		this.messageService.add({
		    severity: "info",
		    summary: "Getting started",
		    detail: "Welcome to SPARQL Explorer!\n\n" +
			"Click here to see the the Getting Started " +
			"guide, also available on the menu",
		    key: "announce",
		    life: 5000,
		    closable: true,
		});
	    }
	);

    }

}

