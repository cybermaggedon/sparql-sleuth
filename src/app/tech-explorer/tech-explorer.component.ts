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

    states = ["unvoted", "hold", "assess", "trial", "adopt", "exhaust"];

    labels : { [key : string] : string } = {
	hold: "Hold",
	assess: "Assess",
	trial: "Trial",
	adopt: "Adopt",
	exhaust: "Exhaust",
	unvoted: "Not voted",
    };

    items : { [key : string] : string[] } = {
	unvoted: [
	    "Cryptocurrency", "Fusion energy", "Hydrogen heating",
	    "Autonomous vehicles", "EV delivery", "EV freight",
	    "Virtual reality", "Air polutant removal", "CO2 sinks",
	    "Artificial Intelligence",  "Generative AI",
	    "Synthetic data", "Transparent security",
	    "Passwordless authentication", "Homomorphic encryption",
	    "Digital ethics", "AIASE", "Digital twin", "IoT platform",
	    "Self-supervised learning", "Multimodal UI", "LCAP",
	    "Collaborative ecosystem", "Virtual assistants",
	    "6G", "Hyperscale edge computing",
	],
	hold: [],
	assess: [],
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



