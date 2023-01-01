
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';

import { Uri } from '../../rdf/triple';
import { Node, Relationship } from '../../graph/graph';

import { RelationshipService } from '../../graph/relationship.service';
import { CommandService } from '../../graph/command.service';
import { PropertiesService, Properties } from '../../graph/properties.service';
import { EventService } from '../../graph/event.service';

// Which dialog is open.  Can only be 1 at once.
enum DialogState {
    NONE,
    NODE,
    SEARCH,
    SCHEMA,
    DATASET,
};

@Component({
    selector: 'graph-viewer',
    templateUrl: './graph-viewer.component.html',
    styleUrls: ['./graph-viewer.component.scss']
})
export class GraphViewerComponent implements OnInit {

    constructor(
	private command : CommandService,
	private route : ActivatedRoute,
	private propertyService : PropertiesService,
	private events : EventService,
	private relationship : RelationshipService,
    ) {
    }

    state : DialogState = DialogState.NONE;

    properties : Properties = new Properties();

    // FIXME: quad-state type needed.
    get nodeDialogVisible() { return this.state == DialogState.NODE; }
    get searchDialogVisible() { return this.state == DialogState.SEARCH; }
    get schemaDialogVisible() { return this.state == DialogState.SCHEMA; }
    get datasetDialogVisible() { return this.state == DialogState.DATASET; }

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

    }

    closeNodeDialog() {
	if (this.state == DialogState.NODE)
	    this.state = DialogState.NONE;
	this.events.unselect();
    }

    search() {
	this.state = DialogState.SEARCH;
    }

    schema() {
	this.state = DialogState.SCHEMA;
    }

    closeSearchDialog() {
	if (this.state == DialogState.SEARCH)
	    this.state = DialogState.NONE;
	this.events.unselect();
    }

    closeSchemaDialog() {
	if (this.state == DialogState.SCHEMA)
	    this.state = DialogState.NONE;
    }

    closeDatasetDialog() {
	if (this.state == DialogState.DATASET)
	    this.state = DialogState.NONE;
    }

    dataset() {
	this.state = DialogState.DATASET;
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

