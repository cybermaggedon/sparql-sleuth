import { Component, OnInit } from '@angular/core';

import { GalleryService, GalleryItem } from '../../gallery.service';

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

    constructor(
	private galleryService : GalleryService,
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

}

