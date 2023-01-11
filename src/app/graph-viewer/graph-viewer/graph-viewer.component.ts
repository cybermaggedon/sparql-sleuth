
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';

import { Uri } from '../../rdf/triple';
import { Node, Relationship } from '../../graph/graph';

import { RelationshipService } from '../../graph/relationship.service';
import { CommandService, Command } from '../../command.service';
import { PropertiesService, Properties } from '../../graph/properties.service';
import { EventService } from '../../graph/event.service';
import { MessageService } from '../../message.service';
import { GalleryService } from '../../gallery.service';
import { GraphService } from '../../graph/graph.service';
import { DatasetsService } from '../../query/datasets.service';
import { SchemaService } from '../../query/schema.service';
import { Row } from '../../query/query';

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
})
export class GraphViewerComponent implements OnInit {

    schema : Row[] = [];
    datasets : Row[] = [];
    state : DialogState = DialogState.NONE;
    properties : Properties = new Properties();
    selection? : Node;
    relationships : Relationship[] = [];

    constructor(
	private command : CommandService,
	private route : ActivatedRoute,
	private propertyService : PropertiesService,
	private events : EventService,
	private relationship : RelationshipService,
	private message : MessageService,
	private gallery : GalleryService,
	private graph : GraphService,
	private datasetsService : DatasetsService,
	private schemaService : SchemaService,
    ) {
    }

    get nodeDialogVisible() { return this.state == DialogState.NODE; }
    get searchDialogVisible() { return this.state == DialogState.SEARCH; }
    get schemaDialogVisible() { return this.state == DialogState.SCHEMA; }
    get infoDialogVisible() { return this.state == DialogState.INFO; }
    get datasetsDialogVisible() { return this.state == DialogState.DATASETS; }
    get aboutDialogVisible() { return this.state == DialogState.ABOUT; }
    get exportDialogVisible() { return this.state == DialogState.EXPORT; }
    get importDialogVisible() { return this.state == DialogState.IMPORT; }
    get galleryDialogVisible() { return this.state == DialogState.GALLERY; }

    ngOnInit() : void {

	this.events.nodeSelectedEvents().subscribe(
	    ev => {

		this.selection = ev.node;

		this.relationships = [];

		this.relationship.getRelationships(
		    new Uri(ev.node.id)
		).subscribe(
		    ev => {
			this.relationships = ev;
		    }
		);

		this.propertyService.getProperties(ev.node).subscribe(
		    props => {
			this.properties = props;
			console.log(props);
			this.state = DialogState.NODE;
		    }
		);

	    }
	    
	);

	this.command.command(Command.SCHEMA).subscribe(
	    () => {
	       this.schemaService.getSchema().subscribe(
		   sch => {
		       this.schema = sch.data;
		       this.state = DialogState.SCHEMA;
		   }
	       );
	    }
	);

	this.command.command(Command.DATASETS).subscribe(
	    () => {
	       this.datasetsService.getDatasets().subscribe(
		   ds => {
		       this.datasets = ds;
		       this.state = DialogState.DATASETS
		   }
	       );
	    }
	);

	this.events.nodeDeselectedEvents().subscribe(
	    ev => {
		if (this.state == DialogState.NODE)
		    this.state = DialogState.NONE;
	    }
	    
	);

	// We'll deal with the recentre events here, just re-route.
	this.command.command(Command.RECENTRE).subscribe(
	    ev => {
		this.events.recentre(new Uri(ev.recentre.id));
	    }

	);

	this.command.command(Command.BEGIN_SEARCH).subscribe(
	    () => this.state = DialogState.SEARCH
	);

	this.command.command(Command.SEARCH).subscribe(
	    () => this.state = DialogState.SEARCH
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

	this.command.command(Command.RESET).subscribe(
	    () => {
		this.events.reset();
		this.state = DialogState.NONE;
	    }
	);

	// Close the gallery dialog once an item has been selected for loading
	this.command.command(Command.LOAD_GALLERY_ITEM).subscribe(
	    () => this.state = DialogState.NONE
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

    parseParams(params : any) {
	
	if (params["node"]) {

	    const id = params["node"];

	    let relationships = "no";
	    
	    if (params["relationships"]) {
		relationships = params["relationships"];
	    }

	    if (id) {
		timer(1).subscribe(
		    () => {

			let i = new Uri(id);

			this.events.recentre(i);

			if (relationships != "no")
			    this.relationship.getRelationships(i).
			    subscribe(
				rels => {
				    for (let rel of rels) {

					if (rel.inward &&
					    (relationships == "out"))
					    continue;

					if (!rel.inward && relationships == "in")
					    continue;

					this.graph.relationship(
					    new Uri(id),
					    rel.id,
					    rel.inward
					);
				    }
				}
			    );
		    }
		);
	    }

	}

	if (params["gallery"] && params["gallery"] == "yes")
	    timer(1).subscribe(
		() => this.command.gallery()
	    );

	if (params["search"] && params["search"] == "yes")
	    timer(1).subscribe(
		() => this.command.beginSearch()
	    );

	if (params["run-search"])
	    timer(1).subscribe(
		() => this.command.search(params["run-search"])
	    );

	if (params["schema"] && params["schema"] == "yes")
	    timer(1).subscribe(
		() => this.command.schema()
	    );

	if (params["datasets"] && params["datasets"] == "yes")
	    timer(1).subscribe(
		() => this.command.datasets()
	    );

	if (params["export"] && params["export"] == "yes")
	    timer(1).subscribe(
		() => this.command.graphExport()
	    );

	if (params["import"] && params["import"] == "yes")
	    timer(1).subscribe(
		() => this.command.graphImport()
	    );

	if (params["info"] && params["info"] == "yes")
	    timer(1).subscribe(
		() => this.command.info()
	    );

	if (params["about"] && params["about"] == "yes")
	    timer(1).subscribe(
		() => this.command.about()
	    );

	if (!params["announce"] || !(params["announce"] == "no")) {
	    timer(1).subscribe(
		() => this.message.announce()
	    );
	}

	if (params["load-gallery"])
	    timer(1).subscribe(
		() => this.loadGallery(params["load-gallery"])
	    );

    }

    ngAfterViewInit(): void {

	this.route.queryParams.subscribe(
	    params => this.parseParams(params)
	);

    }

    loadGallery(wanted : string) {

	this.gallery.getGallery().subscribe(
	    gallery => {

		for(let item of gallery) {

		    if (item["title"] == wanted) {
			this.command.loadGalleryItem(item["graph"]);
			break;
		    }
		    
		}
		
	    }
	);
	
    }

}

