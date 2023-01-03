import { Component, OnInit } from '@angular/core';

import { GalleryService, GalleryItem } from '../../gallery.service';
import { SerialisationService } from '../../graph/serialisation.service';

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

    constructor(
	private galleryService : GalleryService,
	private ss : SerialisationService,
    ) {
    }

    gallery : GalleryItem[] = [];

    ngOnInit(): void {
	this.galleryService.getGallery().subscribe(
	    g => {
		this.gallery = g;
		console.log(g);
	    }
	);
    }

    filterby = "";

    filter() {
	console.log(this.filterby);
    }

    load(graph : any) {
	this.ss.deserialise(graph["graph"]);
    }

}

