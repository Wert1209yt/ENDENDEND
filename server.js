const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

// Папка со старыми файлами YouTube (скачанные из Wayback Machine)
const STATIC_DIR = path.join(__dirname, "youtube-2016");

// Раздаём старые файлы YouTube
app.use(express.static(STATIC_DIR));

// Настройки нового YouTube API
const YT_NEW_API = "https://www.youtube.com/youtubei/v1";
const CLIENT_VERSION = "1.20240310.00.00"; // Обновляем по необходимости

// Прокси для старого API (например, запрос рекомендаций)
app.get("/feed", async (req, res) => {
    try {
        const response = await axios.post(`${YT_NEW_API}/browse`, {
            context: {
                client: {
                    clientName: "WEB",
                    clientVersion: CLIENT_VERSION
                }
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send("Ошибка проксирования API");
    }
});

// Проксируем запросы на YouTube (например, видео)
app.use("/watch", createProxyMiddleware({
    target: "https://www.youtube.com",
    changeOrigin: true
}));

// Запуск сервера
app.listen(PORT, () => console.log(`Прокси-сервер работает на http://localhost:${PORT}`));
