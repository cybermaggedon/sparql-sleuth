
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Node } from './graph.service';
import { Expansion } from './expansion.service';

export enum Direction {
  IN = 0,
  OUT,
  BOTH,
}

export class ExpandEvent {
    node : Node = new Node();
    expansion : Expansion = new Expansion();
};

export class RecentreEvent {
    id : string = "";
};

@Injectable({
    providedIn: 'root'
})
export class CommandService {

    constructor(
	private route : Router,
    ) {

	// We'll deal with the recentre events here, just re-route.
	this.recentreEvents().subscribe(
	    ev => 
	    this.route.navigate(
		['/graph'],
		{ queryParams: { 'node': ev.id }}
	    )
	);

    }

    private expandSubject = new Subject<ExpandEvent>;
    private recentreSubject = new Subject<RecentreEvent>;
    private showSchemaSubject = new Subject<void>;
    private beginSearchSubject = new Subject<void>;
    private helpSubject = new Subject<void>;

    expandEvents() { return this.expandSubject; }
    recentreEvents() { return this.recentreSubject; }
    showSchemaEvents() { return this.showSchemaSubject; }
    beginSearchEvents() { return this.beginSearchSubject; }
    helpEvents() { return this.helpSubject; }

    expand(node : Node, exp : Expansion) {
	let ev = new ExpandEvent;
	ev.node = node;
	ev.expansion = exp;
	this.expandSubject.next(ev);
    }

    recentre(id : string) {
	let ev = new RecentreEvent();
	ev.id = id;
	this.recentreSubject.next(ev);
    }

    showSchema() {
	this.showSchemaSubject.next();
    }

    beginSearch() {
	this.beginSearchSubject.next();
    }

    help() {
	this.helpSubject.next();
    }

}

