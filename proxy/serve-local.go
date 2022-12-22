package main

import (
	"fmt"
	"io/ioutil"
	"io"
	"log"
	"net/http"
	"regexp"
	"os"
)

func copyHeader(dst, src http.Header) {
	for k, vv := range src {
		for _, v := range vv {
			dst.Add(k, v)
		}
	}
}

func handler(w http.ResponseWriter, r *http.Request) {

	filename := r.URL.Path[1:]
	fmt.Println(filename)
	data, err := ioutil.ReadFile(filename)

	if err != nil {
		http.NotFound(w, r)
		return
	}
	
	w.Header().Set("Content-Type", "text/html")
	w.Write(data)

}

func main() {

	var s http.ServeMux

	var pngPath = regexp.MustCompile("^/.*\\.png$")
	var gifPath = regexp.MustCompile("^/.*\\.gif$")
	var cssPath = regexp.MustCompile("^/.*\\.css$")
	var htmlPath = regexp.MustCompile("^/.*\\.html$")
	var xhtmlPath = regexp.MustCompile("^/.*\\.xhtml$")
	var jsPath = regexp.MustCompile("^/.*\\.js$")
	var jsonPath = regexp.MustCompile("^/.*\\.json$")
	var woffPath = regexp.MustCompile("^/.*\\.woff2$")
	var svgPath = regexp.MustCompile("^/.*\\.svg$")
	var apiPath = regexp.MustCompile("^/sparql")

	// Catch all that path navigation junk that spews to the logs
	var sketchy = regexp.MustCompile("\\.\\.")

	listen := ":8080"
	apiEndpoint := "localhost:8089"
	scheme := "http"
	base := "./dist/startup-accounts/"

	if len(os.Args) > 1 {
		listen = os.Args[1]
	}

	// API endpoint in host:port form
	if len(os.Args) > 2 {
		apiEndpoint = os.Args[2]
	}

	if len(os.Args) > 3 {
		scheme = os.Args[3]
	}

	if len(os.Args) > 4 {
		base = os.Args[4]
	}

	s.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		
		if r.URL.Path == "/" { r.URL.Path = "/index.html" }

		fmt.Println(r.URL.Path)

		if m := sketchy.FindStringSubmatch(r.URL.Path); m != nil {
			http.NotFound(w, r)
			return
		}

		if m := apiPath.FindStringSubmatch(r.URL.Path); m != nil {

			path := r.URL.Path[4:]

			r.URL.Path = path
			r.URL.Host = apiEndpoint
			r.URL.Scheme = scheme
			r.Host = apiEndpoint

			fmt.Println(path)

			resp, err := http.DefaultTransport.RoundTrip(r)

			if err != nil {
				log.Printf("503: %s", err.Error())
				http.Error(w, err.Error(),
					http.StatusServiceUnavailable)
				return
			}

			defer resp.Body.Close()
			copyHeader(w.Header(), resp.Header)
			w.Header().Set("Content-Type",
				resp.Header.Get("Content-Type"))
			w.WriteHeader(resp.StatusCode)
			io.Copy(w, resp.Body)
			return

		}

		if true {

			path := r.URL.Path

			r.URL.Path = path
			r.URL.Host = "localhost:4200"
			r.URL.Scheme = "http"
			r.Host = "localhost:4200"

			resp, err := http.DefaultTransport.RoundTrip(r)

			if err != nil {
				log.Printf("503: %s", err.Error())
				http.Error(w, err.Error(),
					http.StatusServiceUnavailable)
				return
			}

			defer resp.Body.Close()
			copyHeader(w.Header(), resp.Header)
//			w.Header().Set("Content-Type", "text/javascript")
			w.WriteHeader(resp.StatusCode)
			io.Copy(w, resp.Body)
			return

		}

		if m := cssPath.FindStringSubmatch(r.URL.Path); m != nil {
			w.Header().Set("Content-Type", "text/css")
			filename := base + r.URL.Path[1:]
			data, _ := ioutil.ReadFile(filename)
			w.Write(data)
			return
		}

		if m := pngPath.FindStringSubmatch(r.URL.Path); m != nil {
			w.Header().Set("Content-Type", "image/png")
			filename := base + r.URL.Path[1:]
			data, _ := ioutil.ReadFile(filename)
			w.Write(data)
			return
		}

		if m := gifPath.FindStringSubmatch(r.URL.Path); m != nil {
			w.Header().Set("Content-Type", "image/gif")
			filename := base + r.URL.Path[1:]
			data, _ := ioutil.ReadFile(filename)
			w.Write(data)
			return
		}

		if m := xhtmlPath.FindStringSubmatch(r.URL.Path); m != nil {
			w.Header().Set("Content-Type", "application/xhtml+xml; charset=utf-8")
			filename := base + r.URL.Path[1:]
			data, _ := ioutil.ReadFile(filename)
			w.Write(data)
			return
		}

		if m := jsPath.FindStringSubmatch(r.URL.Path); m != nil {
			w.Header().Set("Content-Type", "text/javascript")
			filename := base + r.URL.Path[1:]
			data, _ := ioutil.ReadFile(filename)
			w.Write(data)
			return
		}

		if m := jsonPath.FindStringSubmatch(r.URL.Path); m != nil {
			w.Header().Set("Content-Type", "text/javascript")
			filename := base + r.URL.Path[1:]
			data, _ := ioutil.ReadFile(filename)
			w.Write(data)
			return
		}

		if m := woffPath.FindStringSubmatch(r.URL.Path); m != nil {
			w.Header().Set("Content-Type", "text/plain")
			filename := base + r.URL.Path[1:]
			data, _ := ioutil.ReadFile(filename)
			w.Write(data)
			return
		}

		if m := svgPath.FindStringSubmatch(r.URL.Path); m != nil {
			w.Header().Set("Content-Type", "text/xml+svg")
			filename := base + r.URL.Path[1:]
			data, _ := ioutil.ReadFile(filename)
			w.Write(data)
			return
		}

		if m := htmlPath.FindStringSubmatch(r.URL.Path); m != nil {
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			filename := base + r.URL.Path[1:]
			log.Printf(filename)
			data, _ := ioutil.ReadFile(filename)
			w.Write(data)
			return
		}

		// FIXME: Deals with the Angular paths
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		filename := base + "index.html"
		data, _ := ioutil.ReadFile(filename)
		w.Write(data)
		return

		http.NotFound(w, r)
		return
	})

	log.Fatal(http.ListenAndServe(listen, &s))

}

