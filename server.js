"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const dJSON = require("dirty-json");
const he = require("he");

const app = express();
const port = 8080;

app.use(bodyParser.text({ type: ["text/plain", "application/json"] }));

function removeBBCode(str) {
  return str?.replace(/\[\/?[\w=\-\s":.#]+\]/g, "") || "";
}

function extractJsonString(input) {
  const match = input.match(/(?:'text=)?(\{.*\})/s);
  return match?.[1]?.trim() || input.trim();
}

app.post("/process", (req, res) => {
  try {
    const inputText = req.body;
    if (!inputText) throw new Error("Пустой входной текст");

    const jsonStr = extractJsonString(inputText);
    const parsed = dJSON.parse(jsonStr);

    if (parsed.comment) {
      parsed.comment = removeBBCode(he.decode(parsed.comment));
    }

    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`Сервер слушает http://localhost:${port}`);
});
