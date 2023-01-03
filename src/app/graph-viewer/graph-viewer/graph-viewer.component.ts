
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';

import { MenuItem, MessageService } from 'primeng/api';

import { Uri } from '../../rdf/triple';
import { Node, Relationship } from '../../graph/graph';

import { RelationshipService } from '../../graph/relationship.service';
import { CommandService, Command } from '../../command.service';
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
    EXPORT,
    IMPORT,
    GALLERY,
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


    state : DialogState = DialogState.NONE;

    properties : Properties = new Properties();

    // FIXME: quad-state type needed.
    get nodeDialogVisible() { return this.state == DialogState.NODE; }
    get searchDialogVisible() { return this.state == DialogState.SEARCH; }
    get schemaDialogVisible() { return this.state == DialogState.SCHEMA; }
    get infoDialogVisible() { return this.state == DialogState.INFO; }
    get datasetsDialogVisible() { return this.state == DialogState.DATASETS; }
    get aboutDialogVisible() { return this.state == DialogState.ABOUT; }
    get exportDialogVisible() { return this.state == DialogState.EXPORT; }
    get importDialogVisible() { return this.state == DialogState.IMPORT; }
    get galleryDialogVisible() { return this.state == DialogState.GALLERY; }

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

	this.command.command(Command.BEGIN_SEARCH).subscribe(
	    () => this.state = DialogState.SEARCH
	);

	this.command.command(Command.SCHEMA).subscribe(
	    () => this.state = DialogState.SCHEMA
	);

	this.command.command(Command.DATASETS).subscribe(
	    () => this.state = DialogState.DATASETS
	);

	this.command.command(Command.INFO).subscribe(
	    () => this.state = DialogState.INFO
	);

	this.command.command(Command.ABOUT).subscribe(
	    () => this.state = DialogState.ABOUT
	);

	this.command.command(Command.IMPORT).subscribe(
	    () => this.state = DialogState.IMPORT
	);

	this.command.command(Command.GALLERY).subscribe(
	    () => this.state = DialogState.GALLERY
	);

	this.command.command(Command.EXPORT).subscribe(
	    () => this.state = DialogState.EXPORT
	);

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

    closeImportDialog() {
	if (this.state == DialogState.IMPORT)
	    this.state = DialogState.NONE;
    }

    closeGalleryDialog() {
	if (this.state == DialogState.GALLERY)
	    this.state = DialogState.NONE;
    }

    closeExportDialog() {
	if (this.state == DialogState.EXPORT)
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

    }

}

