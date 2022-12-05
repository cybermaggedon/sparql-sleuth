
FROM fedora:36

RUN dnf update -y && dnf install -y libgo && dnf clean all

COPY serve /usr/local/bin/serve

RUN mkdir /usr/local/web/
COPY dist/sparql-explorer /usr/local/web/

WORKDIR /usr/local/web/
CMD /usr/local/bin/serve 0:8080 sparql:8089 http ''

EXPOSE 8080

