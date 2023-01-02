
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

import { SerialisationService } from '../../graph/serialisation.service';

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
	private serialisation : SerialisationService,
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

	this.command.command(Command.SERIALISE).subscribe(
	    () => this.serialisation.serialise().subscribe(
		res => console.log(res)
	    )
	);

	this.command.command(Command.DESERIALISE).subscribe(
	    () => {

	    let enc = '{"nodes":[{"id":"http://pivotlabs.vc/innov/dataset/dasa-challenges","x":-212,"y":-176},{"id":"https://schema.org/Dataset","x":17,"y":37},{"id":"http://pivotlabs.vc/innov/dataset/ktn-challenges","x":313,"y":125},{"id":"http://pivotlabs.vc/innov/dataset/ktnie-challenges","x":-141,"y":310},{"id":"http://pivotlabs.vc/innov/dataset/ncsc-challenges","x":277,"y":-150},{"id":"http://pivotlabs.vc/innov/dataset/organisations","x":129,"y":332},{"id":"http://pivotlabs.vc/innov/dataset/ukri-challenges","x":41,"y":-278},{"id":"http://pivotlabs.vc/innov/dataset/ukri-organogram","x":-301,"y":83}],"edges":[{"from":"http://pivotlabs.vc/innov/dataset/dasa-challenges","to":"https://schema.org/Dataset"},{"from":"http://pivotlabs.vc/innov/dataset/ktn-challenges","to":"https://schema.org/Dataset"},{"from":"http://pivotlabs.vc/innov/dataset/ktnie-challenges","to":"https://schema.org/Dataset"},{"from":"http://pivotlabs.vc/innov/dataset/ncsc-challenges","to":"https://schema.org/Dataset"},{"from":"http://pivotlabs.vc/innov/dataset/organisations","to":"https://schema.org/Dataset"},{"from":"http://pivotlabs.vc/innov/dataset/ukri-challenges","to":"https://schema.org/Dataset"},{"from":"http://pivotlabs.vc/innov/dataset/ukri-organogram","to":"https://schema.org/Dataset"}]}';
	    this.serialisation.deserialise(enc).subscribe(
		() => { console.log("DESER"); }
	    )
	    }
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

