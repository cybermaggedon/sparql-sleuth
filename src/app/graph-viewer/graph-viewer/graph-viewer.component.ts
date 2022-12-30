
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';

import { Uri } from '../../rdf/triple';
import { Node, Relationship } from '../../graph/graph';

import { RelationshipService } from '../../graph/relationship.service';
import { CommandService } from '../../graph/command.service';
import { PropertiesService, Properties } from '../../graph/properties.service';
import { EventService } from '../../graph/event.service';
import { NodeDialogComponent } from '../node-dialog/node-dialog.component';


enum BottomPaneMode {
    HELP,
    EMPTY,
    DETAIL,
    SEARCH
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

    mode : BottomPaneMode = BottomPaneMode.HELP;

    get detailMode() : boolean { return this.mode == BottomPaneMode.DETAIL; }
    get searchMode() : boolean { return this.mode == BottomPaneMode.SEARCH; }
    get helpMode() : boolean { return this.mode == BottomPaneMode.HELP; }

    properties : Properties = new Properties();

    nodeDialogVisible = false;

    selection? : Node;

    relationships : Relationship[] = [];

    ngOnInit() : void {

	this.command.beginSearchEvents().subscribe(
	    () => {
		this.mode = BottomPaneMode.SEARCH;
	    }
	);

	this.command.helpEvents().subscribe(
	    () => {
		this.mode = BottomPaneMode.HELP;
	    }
	);

	this.propertyService.propertiesEvents().subscribe(
	    ev => {
		this.properties = ev;
		this.mode = BottomPaneMode.DETAIL;
		this.nodeDialogVisible = true;
	    }
	);

	this.events.nodeDeselectedEvents().subscribe(
	    () => {
		this.mode = BottomPaneMode.EMPTY;
		this.selection = undefined;
	    }
	);

	this.events.nodeSelectedEvents().subscribe(
	    ev => {

		this.selection = ev.node;

		this.relationships = [];

		this.relationship.getRelationships(ev.node).subscribe(
		    ev => this.relationships = ev
		);

	    }
	    
	);

    }

    closeDialog() {
	this.nodeDialogVisible = false;
	// FIXME:
	this.events.unselect();
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

