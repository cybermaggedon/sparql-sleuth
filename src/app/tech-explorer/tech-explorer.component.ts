import { Component, OnInit } from '@angular/core';

import {
    CdkDragDrop, moveItemInArray, transferArrayItem
} from '@angular/cdk/drag-drop';

@Component({
    selector: 'tech-explorer',
    templateUrl: './tech-explorer.component.html',
    styleUrls: ['./tech-explorer.component.scss']
})
export class TechExplorerComponent implements OnInit {

    states = ["hold", "assess", "trial", "adopt", "exhaust"];

    labels : { [key : string] : string } = {
	hold: "Hold",
	assess: "Assess",
	trial: "Trial",
	adopt: "Adopt",
	exhaust: "Exhaust",
    };

    items : { [key : string] : string[] } = {
	hold: ['Carrots', 'Tomatoes', 'Onions', 'Apples', 'Avocados'],
	assess: ['Oranges', 'Bananas', 'Cucumbers'],
	trial: [],
	adopt: [],
	exhaust: [],
    };

    constructor() { }

    ngOnInit(): void {
    }

    drop(event: CdkDragDrop<string[]>) {
	if (event.previousContainer === event.container) {
	    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
	} else {
	    transferArrayItem(
		event.previousContainer.data,
		event.container.data,
		event.previousIndex,
		event.currentIndex,
	    );
	}
    }

    dump() {
	console.log(this.items);
    }

}



