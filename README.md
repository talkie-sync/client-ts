# Talkie Sync Client

TypeScript client library for the [Talkie Sync](https://talkie.oskite.com) cloud API.

## Install

```bash
npm install talkie-sync
```

## Usage

Create a project at [talkie.oskite.com](https://talkie.oskite.com) to get an API key, then:

```typescript
import { TalkieClient } from "talkie-sync";

const client = new TalkieClient({
  baseUrl: "https://talkie.oskite.com",
  apiKey: "your-api-key",
});

// Create a pair (initiator)
const { words, session_id, channel_id } = await client.createPair();

// Claim a pair (matcher)
const { session_id, channel_id } = await client.claimPair("aardvark absurd accrue");

// Send a message
await client.pushMessage(channel_id, "hello");

// Poll for messages
const { messages, next_seq } = await client.pollMessages(channel_id, 0, 25000);

// Or list messages (no polling)
const { messages } = await client.listMessages(channel_id);
```

## API

- `createPair(channelId?, sessionId?)` — Create a new pair, returns words
- `claimPair(words)` — Claim a pair with words
- `pushMessage(channelId, payload)` — Send a message
- `pollMessages(channelId, after?, timeout?)` — Long-poll for messages
- `listMessages(channelId, after?)` — List messages without polling
- `getUser()` — Get current user info
- `listProjects()` — List projects
- `getConfig()` — Get tier configuration

## License

MIT
