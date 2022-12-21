
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export enum Direction {
  IN = 0,
  OUT,
  BOTH,
}

export class ExpandEvent {
    dir : Direction = Direction.IN;
    id : string = "";
};

export class RecentreEvent {
    id : string = "";
};

export class ShowSchemaEvent {
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
    private showSchemaSubject = new Subject<ShowSchemaEvent>;

    expandEvents() { return this.expandSubject; }
    recentreEvents() { return this.recentreSubject; }
    showSchemaEvents() { return this.showSchemaSubject; }

    expand(dir : Direction, id : string) {
	let ev = new ExpandEvent;
	ev.dir = dir;
	ev.id = id;
	this.expandSubject.next(ev);
    }

    recentre(id : string) {
	let ev = new RecentreEvent();
	ev.id = id;
	this.recentreSubject.next(ev);
    }

    showSchema() {
	let ev = new ShowSchemaEvent();
	this.showSchemaSubject.next(ev);
    }

}

