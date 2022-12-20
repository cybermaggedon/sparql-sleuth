
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

export class SelectEvent {
    id : string = "";
};

@Injectable({
    providedIn: 'root'
})
export class SelectionService {

    private selectSubject = new Subject<SelectEvent>;
    private unselectSubject = new Subject<void>;

    selectEvents() { return this.selectSubject; }
    unselectEvents() { return this.unselectSubject; }

    select(id : string) {
	let ev = new SelectEvent;
	ev.id = id;
	this.selectSubject.next(ev);
    }

    unselect() {
	this.unselectSubject.next();
    }

    constructor() {
    }

}

