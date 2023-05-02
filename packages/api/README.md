# QA Api

# Error Response

```ts
interface ErrorResponse {
    statusCode: number;
    message: string;
    error: string;
}
```

# Rate Limiting

The rate limit will result in the usual `429` status code with the same response body as an error. There are also the `X-Ratelimit-Limit`, `X-Ratelimit-Remaining`, `X-Ratelimit-Reset` headers if you want to impliment more advanced handling of a rate limit error.

# Endpoints

## POST `/v1/ask`

Body:

```ts
interface Data {
    question: string;
}
```

Response:

```ts
interface Response {
    sources: string[];
    answer: string;
}
```
