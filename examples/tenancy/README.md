# Multitenancy articles system with Access Control

Example of multitenancy system for articles with access control on service level.
[More on this](https://pallad.dev/access-control/multitenancy)

Tenancy is splitted into workspaces. That means an user can operate only within a scope of single workspace while other workspaces might co-exist.

## Authentication

Without providing any authentication you're treated as `Anonymous` user and all you can do is to read articles.

For `authenticated` user use:
* `Authorization` header with value `itsme`
* `x-user-id` with value `1` (for workspace id `1`) or `2` (for workspace id `2`)

For `impersonated` user use:
* `Authorization` header with value `itsme`
* `x-user-id` with value `1` (for workspace id `1`) or `2` (for workspace id `2`)
* `x-impersonator-username` with any non-blank string value

All examples below are using great [httpie](https://httpie.io/) client.

## Getting list of articles

### Anonymous
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
        "title": "Article 2",
        "workspaceId": 2
    }
]
```

### Authenticated

Authenticated user within workspace 1 can see all articles and drafts from own workspace
```bash
http localhost:3000/articles Authorization:itsme x-user-id:1
```
```json
[
    {
        "content": "Article 1 content",
        "id": 1,
        "isPublished": false,
        "title": "Article 1",
        "workspaceId": 1
    },
    {
        "content": "Article 2 content",
        "id": 2,
        "isPublished": true,
        "title": "Article 2",
        "workspaceId": 2
    }
]
```

Authenticated user within workspace 1 can see all articles and drafts from own workspace
```bash
http localhost:3000/articles Authorization:itsme x-user-id:2
```
```json
[
    {
        "content": "Article 2 content",
        "id": 2,
        "isPublished": true,
        "title": "Article 2",
        "workspaceId": 2
    },
    {
        "content": "Article 3 content",
        "id": 3,
        "isPublished": false,
        "title": "Article 3",
        "workspaceId": 2
    }
]
```
### Impersonated
Impersonated user within workspace 1 can see all articles and drafts from own workspace
```bash
http localhost:3000/articles Authorization:itsme x-user-id:1 x-impersonator-username:admin
```
```json
[
    {
        "content": "Article 1 content",
        "id": 1,
        "isPublished": false,
        "title": "Article 1",
        "workspaceId": 1
    },
    {
        "content": "Article 2 content",
        "id": 2,
        "isPublished": true,
        "title": "Article 2",
        "workspaceId": 2
    }
]
```

Impersonated user within workspace 1 can see all articles and drafts from own workspace
```bash
http localhost:3000/articles Authorization:itsme x-user-id:2 x-impersonator-username:admin
```
```json
[
    {
        "content": "Article 2 content",
        "id": 2,
        "isPublished": true,
        "title": "Article 2",
        "workspaceId": 2
    },
    {
        "content": "Article 3 content",
        "id": 3,
        "isPublished": false,
        "title": "Article 3",
        "workspaceId": 2
    }
]
```

## Creating article

### Anonymous
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

### Authenticated

Authenticated user 1
```bash
http POST localhost:3000/articles Authorization:itsme x-user-id:1 title="Article title" content="Article content"
```
```json
{
    "content": "Article content",
    "id": 4,
    "isPublished": false,
    "title": "Article title",
    "workspaceId": 1
}
```

Authenticated user 2
```bash
http POST localhost:3000/articles Authorization:itsme x-user-id:2 title="Article title" content="Article content"
```
```json
{
    "content": "Article content",
    "id": 4,
    "isPublished": false,
    "title": "Article title",
    "workspaceId": 2
}
```

### Impersonated

Impersonated user 1
```bash
http POST localhost:3000/articles Authorization:itsme x-user-id:1 x-impersonator-username:admin title="Article title" content="Article content"
```
```json
{
    "content": "Article content",
    "id": 4,
    "isPublished": false,
    "title": "Article title",
    "workspaceId": 1
}
```

Impersonated user 2
```bash
http POST localhost:3000/articles Authorization:itsme x-user-id:2 x-impersonator-username:admin title="Article title" content="Article content"
```
```json
{
    "content": "Article content",
    "id": 4,
    "isPublished": false,
    "title": "Article title",
    "workspaceId": 2
}
```

## Publishing article

### Anonymous
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

### Authenticated 
Authenticated user 1
```bash
http POST localhost:3000/articles/1/publish Authorization:itsme x-user-id:1
```
```json
{
    "content": "Article 1 content",
    "id": 1,
    "isPublished": true,
    "title": "Article 1",
    "workspaceId": 1
}
```

Authenticated user 2 is not allowed to publish on articles from other workspace
```bash
http POST localhost:3000/articles/1/publish Authorization:itsme x-user-id:2
```
```json
{
    "error": "Not Found",
    "message": "article not found - id: 1",
    "statusCode": 404
}
```

### Impersonated user

Impersonated user 1 cannot publish at all
```bash
http POST localhost:3000/articles/1/publish Authorization:itsme x-user-id:1 x-impersonator-username:admin
```
```json
{
    "error": "Forbidden",
    "message": "Forbidden",
    "statusCode": 403
}
```

Impersonated user 2 cannot publish at all
```bash
http POST localhost:3000/articles/1/publish Authorization:itsme x-user-id:2 x-impersonator-username:admin
```
```json
{
    "error": "Not Found",
    "message": "article not found - id: 1",
    "statusCode": 404
}
```
