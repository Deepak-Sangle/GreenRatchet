# External Integrations & Third-Party Services

## Integration Architecture

- Place all external service integrations in `lib/services/`
- Always wrap service calls in server actions in `app/actions/`
- Use Zod validation for all inputs
- Return `{ success: boolean; data?: T; error?: string }` format

## Environment Variables

- Store all API keys and credentials in `.env`
- Always check if environment variables exist before using
- Always sync .env.example with .env file without actual
  secret values
- Never use non-null assertion (`!`) on environment variables

## Error Handling

- Use `AbortController` for request timeouts (default 10s)
- Implement exponential backoff for retries (3 attempts)
- Log every errors server-side with `console.error`
- Return user-friendly error messages to client
- Handle `AbortError` separately for timeout messages

## Auto-Save Pattern

When fetching external data that should be saved:

1. Fetch data from external service
2. Immediately save to database in same action
3. Show success message if both operations succeed
4. Show "Fetched but failed to save" if save fails
5. Update local state to reflect saved value
