# QA Api

# Error Response

```ts
interface ErrorResponse {
    statusCode: number;
    message: string;
    error: string;
}
```

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
