"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const dJSON = require("dirty-json");
const he = require('he');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function removeBBCode(str) {
    if (!str) return "";
    return str.replace(/\[\/?[\w=\-\s":.#]+\]/g, "");
}

function extractJsonString(input) {
    const match = input.match(/'text=(\{.*\})'/s);
    if (match && match[1]) {
        return match[1].trim();
    }
    return input.trim();
}

app.post('/process', (req, res) => {
    const inputText = req.body.text;

    if (!inputText) {
        return res.status(400).json({ error: 'Пустой входной текст' });
    }

    try {
        const jsonStr = extractJsonString(inputText);

        const parsed = dJSON.parse(jsonStr);

        if (parsed.comment) {
            parsed.comment = he.decode(parsed.comment);
            parsed.comment = removeBBCode(parsed.comment);
        }

        res.json(parsed);
    } catch (e) {
        res.status(500).json({ error: `Ошибка при парсинге dirty-json: ${e.message}` });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
