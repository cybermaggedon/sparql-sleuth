
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Node, Relationship } from './graph/graph';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum Direction {
  IN = 0,
  OUT,
  BOTH,
}

export enum Command {
    RELATIONSHIP,
    RECENTRE,
    SCHEMA,
    BEGIN_SEARCH,
    INFO,
    ABOUT,
    DATASETS,
};

class CommandEvent {
    kind: Command = Command.ABOUT;
    relationship : RelationshipEvent = new RelationshipEvent();
    recentre : RecentreEvent = new RecentreEvent();
};

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
	this.command(Command.RECENTRE).subscribe(
	    ev => 
	    this.route.navigate(
		['/graph'],
		{ queryParams: { 'node': ev.recentre.id }}
	    )
	);

    }

    private commandSubject = new Subject<CommandEvent>;

    events() { return this.commandSubject; }

    command(command : Command) {
	return this.events().pipe(
	    filter(
		c => c.kind == command
	    )
	);
    }

    relationship(node : Node, rel : Relationship) {
	let ev = new CommandEvent;
	ev.kind = Command.RELATIONSHIP;
	ev.relationship.node = node;
	ev.relationship.relationship = rel;
	this.commandSubject.next(ev);
    }

    recentre(id : string) {
	let ev = new CommandEvent();
	ev.kind = Command.RECENTRE;
	ev.recentre.id = id;
	this.commandSubject.next(ev);
    }

    beginSearch() {
	let ev = new CommandEvent();
	ev.kind = Command.BEGIN_SEARCH;
	this.commandSubject.next(ev);
    }

    info() {
	let ev = new CommandEvent();
	ev.kind = Command.INFO;
	this.commandSubject.next(ev);
    }

    about() {
	let ev = new CommandEvent();
	ev.kind = Command.ABOUT;
	this.commandSubject.next(ev);
    }

    schema() {
	let ev = new CommandEvent();
	ev.kind = Command.SCHEMA;
	this.commandSubject.next(ev);
    }

    datasets() {
	let ev = new CommandEvent();
	ev.kind = Command.DATASETS;
	this.commandSubject.next(ev);
    }

}

