import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import {
  middleware,
  messagingApi,
  SignatureValidationFailed,
  JSONParseError,
  type webhook,
} from "@line/bot-sdk";
import OpenAI from "openai";

const channelSecret = process.env.LINE_CHANNEL_SECRET ?? "";
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";

const openai = new OpenAI();
const lineClient = new messagingApi.MessagingApiClient({ channelAccessToken });

async function handleEvent(event: webhook.Event): Promise<void> {
  if (event.type !== "message") return;
  if (event.message.type !== "text") return;
  if (event.replyToken === undefined) return;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: event.message.text }],
  });
  const text = completion.choices[0]?.message.content;
  if (!text) return;

  await lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: "text", text }],
  });
}

const app = express();
app.use(cors());
app.use("/webhook", middleware({ channelSecret }));

app.post("/webhook", async (req, res) => {
  const events: webhook.Event[] = req.body.events ?? [];

  // LINE times out webhook deliveries quickly, so acknowledge before
  // waiting on OpenAI.
  res.sendStatus(200);

  await Promise.all(
    events.map(event =>
      handleEvent(event).catch(err => {
        console.error("failed to handle event", err);
      }),
    ),
  );
});

const lineErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof SignatureValidationFailed) {
    res.status(401).json({ message: "invalid signature" });
    return;
  }
  if (err instanceof JSONParseError) {
    res.status(400).json({ message: "invalid request body" });
    return;
  }
  next(err);
};
app.use(lineErrorHandler);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
