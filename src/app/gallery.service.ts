
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, retry, mergeMap, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from './config.service';

export interface GalleryItem {
    title : string;
    description : string;
    keywords : string[];
    graph : string;
    image : string;
};

@Injectable({
    providedIn: 'root'
})
export class GalleryService {

    constructor(
	private httpClient : HttpClient,
	private config : ConfigService,
    ) {

    }

    getGallery() : Observable<GalleryItem[]> {

	return this.config.getGallery().pipe(
	    mergeMap(
		gallery => {

		    let res : any[] = [];

		    for (let item of gallery) {
			res.push(
			    this.httpClient.get(
				item["graph"],
				{
				    responseType: "text",
				}
			    ).pipe(
				map(
				    graph => {
					return {
					    title: item["title"],
					    description: item["description"],
					    keywords: item["keywords"],
					    graph: graph,
					    image: item["image"],
					};
				    }
				)
			    )
			);
		    }

		    return forkJoin(res);
		}
	    )
	);

    }

}

