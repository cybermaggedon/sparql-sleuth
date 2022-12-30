
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';

import { Uri } from '../../rdf/triple';
import { Node, Relationship } from '../../graph/graph';

import { RelationshipService } from '../../graph/relationship.service';
import { CommandService } from '../../graph/command.service';
import { PropertiesService, Properties } from '../../graph/properties.service';
import { EventService } from '../../graph/event.service';

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

    properties : Properties = new Properties();

    nodeDialogVisible = false;
    searchDialogVisible = false;
    schemaDialogVisible = false;

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
		if (this.nodeDialogVisible)
		    this.nodeDialogVisible = false;
	    }
	    
	);

	this.propertyService.propertiesEvents().subscribe(
            ev => {
		this.properties = ev;
		this.nodeDialogVisible = true;
		this.searchDialogVisible = false;
		this.schemaDialogVisible = false;
            }
	);

    }

    closeNodeDialog() {
	this.nodeDialogVisible = false;
	// FIXME:
	this.events.unselect();
    }

    search() {
	this.searchDialogVisible = true;
	this.nodeDialogVisible = false;
	this.schemaDialogVisible = false;
    }

    schema() {
	this.schemaDialogVisible = true;
	this.nodeDialogVisible = false;
	this.searchDialogVisible = false;
    }

    closeSearchDialog() {
	this.searchDialogVisible = false;
	this.events.unselect();
    }

    closeSchemaDialog() {
	this.schemaDialogVisible = false;
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

