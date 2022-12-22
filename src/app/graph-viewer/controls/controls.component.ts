
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CommandService, Direction } from '../command.service';
import { SelectionService } from '../selection.service';
import { GraphService, Node } from '../graph.service';
import { ExpansionService, Expansion } from '../expansion.service';
import { Query } from '../../query/query';
import { QueryService } from '../../query/query.service';
import { ProgressService, ProgressEvent, Activity } from '../../progress.service';

@Component({
  selector: 'controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {

    selection : Node | null = null;

    info1 : string = "";
    info2 : string = "";

    expansions : Expansion[] = [];

    constructor(
	private command : CommandService,
	private select : SelectionService,
	private graph : GraphService,
	private expansion : ExpansionService,
	private router : Router,
	private query : QueryService,
	private progress : ProgressService,
    ) {

	this.graph.nodeSelectEvents().subscribe(
	    ev => {

		this.selection = ev.node;

		this.expansions = [];

		this.expansion.getExpansions(ev.node).subscribe(
		    ev => this.expansions = ev
		);

	    }
	    
	);

	this.graph.nodeDeselectEvents().subscribe(
	    () => {
		this.selection = null;
		this.expansions = [];
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

    expand(exp : Expansion) {

	if (!this.selection) return;

	this.command.expand(this.selection, exp);

    }

    schema() {
	this.command.showSchema();
    }

    beginSearch() {
	this.command.beginSearch();
    }

}

