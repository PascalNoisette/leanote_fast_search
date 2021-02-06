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

Any index named "notes" and "attachs" will be dropped with a "attachment" pipeline.
```
docker-compose exec elasticsearch bin/elasticsearch-plugin install --batch ingest-attachment
docker-compose restart elasticsearch
docker-compose run --rm indexer install
docker-compose run --rm indexer install-ingest
```
## Reindex cronjob

The first launch will index all note, and the followings will check the last known UpdatedTime in elasticsearch compared to the UpdatedTime of the last created or modified notes and send the one missing. 
```
docker-compose run --rm indexer reindex
docker-compose run --rm indexer attach
```

## Options

| Environnement variable | Default                              | Description                  |
| ---------------------- |:------------------------------------:| ----------------------------:|
| SUPPORTED_FORMAT       | 'pdf,doc,docx,xls,xlsx,epub,ods,odt' | Index only this content type |
| NODE_ENV               |                                      | Can be production, faster    |
| BACKEND_PORT           | 3000                                 | TCP port                     |
| STORAGE_PATH           | '/leanote/data/'                     | Leanote storage directory    |
| ES_HOST                | 'https://admin:admin@127.0.0.1'      | Index only this content type |
| MONGO_HOST             | 'mongodb://127.0.0.1:27017/leanote'  | Index only this content type |


