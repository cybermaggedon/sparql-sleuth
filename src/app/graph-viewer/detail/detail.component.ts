
import { Component, OnInit, Input } from '@angular/core';

import { GraphService } from '../../graph/graph.service';
import { Properties } from '../../graph/properties.service';

@Component({
    selector: 'detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

    selected : string | undefined;
    selectedLabel : string | undefined;
    selectedThumbnail : string | undefined;
    selectedLink : string | undefined;

    @Input("properties") allProperties : Properties = new Properties();

    get properties() { return this.allProperties.properties; }

    constructor(
	private graph : GraphService,
    ) { }

    ngOnInit(): void {
    }

    get label() : string {
	if ("title" in this.properties) {
	    return this.properties["title"];
	} else if ("label" in this.properties) {
	    return this.properties["label"];
	} else
	    return "";
    }
    
    get link() : string {
	if ("link" in this.properties)
	    return this.properties["link"];
	else
	    return "";
    }

    get thumbnail() : string {
	if ("thumbnail" in this.properties)
	    return this.properties["thumbnail"];
	else
	    return "";
    }

}
