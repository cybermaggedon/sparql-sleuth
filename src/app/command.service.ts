
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Node, Relationship } from './graph/graph';

export enum Direction {
  IN = 0,
  OUT,
  BOTH,
}

export class RelationshipEvent {
    node : Node = new Node();
    relationship : Relationship = new Relationship();
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

    private relationshipSubject = new Subject<RelationshipEvent>;
    private recentreSubject = new Subject<RecentreEvent>;
    private showSchemaSubject = new Subject<void>;
    private beginSearchSubject = new Subject<void>;
    private infoSubject = new Subject<void>;
    private aboutSubject = new Subject<void>;
    private schemaSubject = new Subject<void>;
    private datasetsSubject = new Subject<void>;

    relationshipEvents() { return this.relationshipSubject; }
    recentreEvents() { return this.recentreSubject; }
    showSchemaEvents() { return this.showSchemaSubject; }
    beginSearchEvents() { return this.beginSearchSubject; }
    infoEvents() { return this.infoSubject; }
    aboutEvents() { return this.aboutSubject; }
    schemaEvents() { return this.schemaSubject; }
    datasetsEvents() { return this.datasetsSubject; }

    relationship(node : Node, rel : Relationship) {
	let ev = new RelationshipEvent;
	ev.node = node;
	ev.relationship = rel;
	this.relationshipSubject.next(ev);
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

    info() {
	this.infoSubject.next();
    }

    about() {
	this.aboutSubject.next();
    }

    schema() {
	this.schemaSubject.next();
    }

    datasets() {
	this.datasetsSubject.next();
    }

}

