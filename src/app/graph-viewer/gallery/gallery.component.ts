import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GalleryService, GalleryItem } from '../../gallery.service';
import { CommandService, Command } from '../../command.service';

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

    constructor(
	private galleryService : GalleryService,
	private command : CommandService,
	private router : Router,
    ) {
    }

    gallery : GalleryItem[] = [];

    ngOnInit(): void {

	this.command.command(Command.GALLERY).subscribe(
	    () => {
		this.loadGallery();
	    }
	);
    }

    loadGallery() {

	this.galleryService.getGallery().subscribe(
	    g => {
		this.gallery = g;
	    }
	);
	
    }

    filterby = "";

    load(graph : any) {
	this.router.navigate(
	    ["/graph"],
	    {
		queryParams: {
		    "load-gallery": graph["title"],
		    "announce": "no",
		}
	    }
	);
    }

}

