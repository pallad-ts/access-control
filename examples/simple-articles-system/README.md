# Simple articles system with Access Control

This is example of very simple articles management system.
[More on this](http://localhost:3000/access-control/tutorial)

## Authentication

Without providing any authentication you're treated as `Anonymous` user and all you can do is to read articles.

To test `authenticated` user just provide `itsme` for `Authorization` header.

All examples below are using great [httpie](https://httpie.io/) client.

## Getting list of articles

Anonymous user can see only published articles.
```bash
http localhost:3000/articles
``` 
```json
[
    {
        "content": "Article 2 content",
        "id": 2,
        "isPublished": true,
        "title": "Article 2"
    }
]
```

Authenticated user can see unpublished articles
```bash
http localhost:3000/articles Authorization:itsme
```
```json
[
    {
        "content": "Article 1 content",
        "id": 1,
        "isPublished": false,
        "title": "Article 1"
    },
    {
        "content": "Article 2 content",
        "id": 2,
        "isPublished": true,
        "title": "Article 2"
    }
]
```

## Creating article

Action is not allowed for anonymous users
```bash
http POST localhost:3000/articles title="Article title" content="Article content"
```
```json
{
    "error": "Forbidden",
    "message": "Forbidden",
    "statusCode": 403
}
```

All fine for authenticated one
```bash
http POST localhost:3000/articles title="Article title" content="Article content" Authorization:itsme
```
```json
{
    "content": "Article content",
    "id": 3,
    "isPublished": false,
    "title": "Article title"
}
```

## Updating article
Anonymous
```bash
http PUT localhost:3000/articles/2 title="Article title"
```
```json
{
    "error": "Forbidden",
    "message": "Forbidden",
    "statusCode": 403
}
```

Authenticated
```bash
http PUT localhost:3000/articles/2 title="Article title" Authorization:itsme
```

```json
{
    "content": "Article 2 content",
    "id": 2,
    "isPublished": true,
    "title": "Article title"
}
```

## Deleting article

Anonymous
```bash
http DELETE localhost:3000/articles/2
```
```json
{
    "error": "Forbidden",
    "message": "Forbidden",
    "statusCode": 403
}
```

Authenticated
```bash
http DELETE localhost:3000/articles/1 Authorization:itsme
```
```http
HTTP/1.1 200 OK
```

## Publishing article
Anonymous
```bash
http POST localhost:3000/articles/1/publish
```
```json
{
    "error": "Forbidden",
    "message": "Forbidden",
    "statusCode": 403
}
```

Authenticated
```bash
http POST localhost:3000/articles/1/publish Authorization:itsme
```
```json
{
    "content": "Article 1 content",
    "id": 1,
    "isPublished": true,
    "title": "Article 1"
}
```

