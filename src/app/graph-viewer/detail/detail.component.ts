
import { Component, OnInit, Input } from '@angular/core';

import { GraphService } from '../../graph/graph.service';
import { Properties, PropertyMap } from '../../graph/properties.service';

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

    get table() {

	let rows : {key: string, value: string}[] = [];

	for(let key in this.properties) {
	    rows.push({
		key: key, value: this.properties[key].value()
	    });
	}
	
	return rows;

    }

    constructor(
	private graph : GraphService,
    ) { }

    ngOnInit(): void {
    }

    get label() : string {
	if ("title" in this.properties) {
	    return this.properties["title"].value();
	} else if ("label" in this.properties) {
	    return this.properties["label"].value();
	} else
	    return "";
    }
    
    get link() : string {
	if ("link" in this.properties)
	    return this.properties["link"].value();
	else
	    return "";
    }

    get thumbnail() : string {
	if ("thumbnail" in this.properties)
	    return this.properties["thumbnail"].value();
	else
	    return "";
    }

}
