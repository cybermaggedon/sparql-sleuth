
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

		//		let enc = '{"nodes":[{"id":"http://pivotlabs.vc/innov/dataset/dasa-challenges","label":"DASA Open Call for Innovation","x":-223,"y":243},{"id":"https://schema.org/Dataset","label":"Dataset","x":0,"y":0},{"id":"http://pivotlabs.vc/innov/dataset/ktn-challenges","label":"Innovate UK - KTN Funding\\nOpportunities","x":331,"y":-15},{"id":"http://pivotlabs.vc/innov/dataset/ktnie-challenges","label":"KTN - Innovation Exchange","x":246,"y":222},{"id":"http://pivotlabs.vc/innov/dataset/ncsc-challenges","label":"NCSC for Startups - Current\\nChallenges","x":-14,"y":-329},{"id":"http://pivotlabs.vc/innov/dataset/organisations","label":"UK innovation organisations","x":-331,"y":16},{"id":"http://pivotlabs.vc/innov/dataset/science-networks","label":"Science Networks","x":17,"y":328},{"id":"http://pivotlabs.vc/innov/dataset/ukri-challenges","label":"UKRI Funding Opportunities","x":-243,"y":-220},{"id":"http://pivotlabs.vc/innov/dataset/ukri-organogram","label":"UK Research and Innovation\\nOrganograms and Senior Salaries","x":219,"y":-246}],"edges":[{"id":"http://pivotlabs.vc/innov/dataset/dasa-challenges//http://ww…rg/1999/02/22-rdf-syntax-ns#type//https://schema.org/Dataset","label":"type","from":"http://pivotlabs.vc/innov/dataset/dasa-challenges","to":"https://schema.org/Dataset"},{"id":"http://pivotlabs.vc/innov/dataset/ktn-challenges//http://www…rg/1999/02/22-rdf-syntax-ns#type//https://schema.org/Dataset","label":"type","from":"http://pivotlabs.vc/innov/dataset/ktn-challenges","to":"https://schema.org/Dataset"},{"id":"http://pivotlabs.vc/innov/dataset/ktnie-challenges//http://w…rg/1999/02/22-rdf-syntax-ns#type//https://schema.org/Dataset","label":"type","from":"http://pivotlabs.vc/innov/dataset/ktnie-challenges","to":"https://schema.org/Dataset"},{"id":"http://pivotlabs.vc/innov/dataset/ncsc-challenges//http://ww…rg/1999/02/22-rdf-syntax-ns#type//https://schema.org/Dataset","label":"type","from":"http://pivotlabs.vc/innov/dataset/ncsc-challenges","to":"https://schema.org/Dataset"},{"id":"http://pivotlabs.vc/innov/dataset/organisations//http://www.…rg/1999/02/22-rdf-syntax-ns#type//https://schema.org/Dataset","label":"type","from":"http://pivotlabs.vc/innov/dataset/organisations","to":"https://schema.org/Dataset"},{"id":"http://pivotlabs.vc/innov/dataset/science-networks//http://w…rg/1999/02/22-rdf-syntax-ns#type//https://schema.org/Dataset","label":"type","from":"http://pivotlabs.vc/innov/dataset/science-networks","to":"https://schema.org/Dataset"},{"id":"http://pivotlabs.vc/innov/dataset/ukri-challenges//http://ww…rg/1999/02/22-rdf-syntax-ns#type//https://schema.org/Dataset","label":"type","from":"http://pivotlabs.vc/innov/dataset/ukri-challenges","to":"https://schema.org/Dataset"},{"id":"http://pivotlabs.vc/innov/dataset/ukri-organogram//http://ww…rg/1999/02/22-rdf-syntax-ns#type//https://schema.org/Dataset","label":"type","from":"http://pivotlabs.vc/innov/dataset/ukri-organogram","to":"https://schema.org/Dataset"}]}';

		//		let enc = '{"nodes":[{"id":"http://pivotlabs.vc/innov/challenge/141c7711fc3552b4ec3bc2e63ec76ed06a0a23a9","label":"Heat Pump Ready Programme:\\nStream 3: Tri","x":-97,"y":-52},{"id":"http://pivotlabs.vc/innov/t/challenge","label":"challenge","x":102,"y":55}],"edges":[{"id":"http://pivotlabs.vc/innov/challenge/141c7711fc3552b4ec3bc2e6…22-rdf-syntax-ns#type//http://pivotlabs.vc/innov/t/challenge","label":"type","from":"http://pivotlabs.vc/innov/challenge/141c7711fc3552b4ec3bc2e63ec76ed06a0a23a9","to":"http://pivotlabs.vc/innov/t/challenge"}]}';

		let enc = '{"nodes":[{"id":"http://pivotlabs.vc/innov/dataset/dasa-challenges","label":"DASA Open Call for Innovation","x":-97,"y":-52},{"id":"https://schema.org/Dataset","label":"Dataset","x":102,"y":56}],"edges":[{"id":"http://pivotlabs.vc/innov/dataset/dasa-challenges//http://ww…rg/1999/02/22-rdf-syntax-ns#type//https://schema.org/Dataset","label":"type","from":"http://pivotlabs.vc/innov/dataset/dasa-challenges","to":"https://schema.org/Dataset"}]}';

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

