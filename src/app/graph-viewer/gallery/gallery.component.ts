import { Component, OnInit } from '@angular/core';

import { GalleryService, GalleryItem } from '../../gallery.service';
import { CommandService } from '../../command.service';

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

    constructor(
	private galleryService : GalleryService,
	private command : CommandService,
    ) {
    }

    gallery : GalleryItem[] = [];

    ngOnInit(): void {
	this.galleryService.getGallery().subscribe(
	    g => {
		this.gallery = g;
	    }
	);
    }

    filterby = "";

    load(graph : any) {
	this.command.loadGalleryItem(graph["graph"]);
    }

}

