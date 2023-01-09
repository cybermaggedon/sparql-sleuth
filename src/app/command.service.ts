
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
    SEARCH,
    INFO,
    ABOUT,
    DATASETS,
    EXPORT,
    IMPORT,
    GALLERY,
    LOAD_GALLERY_ITEM,
    RESET,
};

class CommandEvent {
    kind: Command = Command.ABOUT;
    relationship : RelationshipEvent = new RelationshipEvent();
    recentre : RecentreEvent = new RecentreEvent();
    galleryItem : string = "";
    search : string = "";
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

    search(text : string) {
	let ev = new CommandEvent();
	ev.kind = Command.SEARCH;
	ev.search = text;
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

    gallery() {
	let ev = new CommandEvent();
	ev.kind = Command.GALLERY;
	this.commandSubject.next(ev);
    }

    graphImport() {
	let ev = new CommandEvent();
	ev.kind = Command.IMPORT;
	this.commandSubject.next(ev);
    }
    
    graphExport() {
	let ev = new CommandEvent();
	ev.kind = Command.EXPORT;
	this.commandSubject.next(ev);
    }

    loadGalleryItem(g : string) {
	let ev = new CommandEvent();
	ev.kind = Command.LOAD_GALLERY_ITEM;
	ev.galleryItem = g;
	this.commandSubject.next(ev);
    }

    reset() {
	let ev = new CommandEvent();
	ev.kind = Command.RESET;
	this.commandSubject.next(ev);
    }

}

