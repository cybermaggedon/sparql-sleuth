
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CommandService, Direction } from '../../graph/command.service';
import { Node, Relationship } from '../../graph/graph';
import { EventService } from '../../graph/event.service';
import { RelationshipService } from '../../graph/relationship.service';
import { Query } from '../../query/query';
import { QueryService } from '../../query/query.service';
import { ProgressService, ProgressEvent } from '../../progress.service';

@Component({
  selector: 'controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {

    selection : Node | null = null;

    info1 : string = "";
    info2 : string = "";

    relationships : Relationship[] = [];

    constructor(
	private command : CommandService,
	private relationship : RelationshipService,
	private router : Router,
	private query : QueryService,
	private progress : ProgressService,
	private events : EventService,
    ) {

	this.events.nodeSelectEvents().subscribe(
	    ev => {

		this.selection = ev.node;

		this.relationships = [];

		this.relationship.getRelationships(ev.node).subscribe(
		    ev => this.relationships = ev
		);

	    }
	    
	);

	this.events.nodeDeselectEvents().subscribe(
	    () => {
		this.selection = null;
		this.relationships = [];
	    }
	);

	this.progress.progressEvents().subscribe(

	    (res : ProgressEvent) => {

		let a = Array.from(res.progress.values());

		if (a.length > 0)
		    this.info1 = a[0] + " ...";
		else
		    this.info1 = "";

		if (a.length > 1)
		    this.info2 = a[1] + " ...";
		else
		    this.info2 = "";

	    }

	);

    }

    ngOnInit(): void {
    }

    recentre() {
	if (this.selection)
	    this.command.recentre(this.selection.id);
    }

    reln(rel : Relationship) {

	if (!this.selection) return;

	this.command.relationship(this.selection, rel);

    }

    schema() {
	this.command.showSchema();
    }

    beginSearch() {
	this.command.beginSearch();
    }

    help() {
	this.command.help();
    }

}

