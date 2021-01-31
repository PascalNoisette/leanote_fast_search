# leanote_fast_search
Index Leanote into elasticsearch for performant searches

## Prerequisite

- You installed and self-host Leanote https://github.com/jim3ma/docker-leanote
- Leanote is behind a nginx reverse proxy


## Configure reverse proxy
 to intercept url the search query and send it to this application instead.

```
server {
   [...]
   location /note/searchNote {
        proxy_pass http://indexer:3000/;
   }
   [...]
}

```


## Configure the stack


```

  elasticsearch:
    image: amazon/opendistro-for-elasticsearch:1.12.0
    restart: unless-stopped
    ports:
    - 9200:9200
    environment:
    - discovery.type=single-node


  indexer:
     image: netpascal0123/leanote_fast_search:release-1.0
     command: serve
     environment:
     - ES_HOST=https://admin:admin@elasticsearch
     - MONGO_HOST=mongodb://mongo:27017/leanote
     ports:
     - 3000:3000

```

## Launch the stack
```
docker-compose up -d
```

## Initial installation (destructive)

Any index named "notes" will be dropped.
```
docker-compose run --rm indexer install
```
## Reindex cronjob

The first launch will index all note, and the followings will check the last known UpdatedTime in elasticsearch compared to the UpdatedTime of the last created or modified notes and send the one missing. 
```
docker-compose run --rm indexer reindex
```
