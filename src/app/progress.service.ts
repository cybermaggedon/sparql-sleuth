
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

export type Activity = string;

export class ProgressEvent {
    progress : Set<Activity> = new Set<Activity>();
    working() : boolean {
	return this.progress.size != 0;
    };
};

@Injectable({
    providedIn: 'root'
})
export class ProgressService {

    lastProgress : Set<Activity> = new Set<Activity>();
    
    private progressSubject = new Subject<ProgressEvent>;

    progressEvents() { return this.progressSubject; }

    progress(progress : Set<Activity>) {
	this.lastProgress = progress;
	this.update();
    }

    add(activity : string) {
	this.lastProgress.add(activity);
	this.update();
    }

    delete(activity : string) {
	this.lastProgress.delete(activity);
	this.update();
    }

    update() {
	let ev = new ProgressEvent();
	ev.progress = this.lastProgress;
	this.progressSubject.next(ev);
    }

    constructor() {
    }

}

