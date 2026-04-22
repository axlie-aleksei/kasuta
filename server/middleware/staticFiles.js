const path = require("path");
const express = require("express");
const { viewsRoot } = require("../config/security");

function send404Html(res) {
  const filePath = path.join(viewsRoot, "404.html");
  res.status(404).sendFile(filePath, (err) => {
    if (err) res.status(404).type("html").send("<!DOCTYPE html><meta charset=utf-8><title>404</title><p>Страница не найдена.</p>");
  });
}

function staticFiles(app) {
  app.use("/public", express.static(path.join(__dirname, "..", "..", "public")));

  app.get("/", (req, res) => {
    const filePath = path.join(viewsRoot, "index.html");
    res.sendFile(filePath, (err) => {
      if (err) send404Html(res);
    });
  });

  app.get("/:page", (req, res) => {
    const raw = req.params.page;
    if (!raw.endsWith(".html")) {
      return send404Html(res);
    }
    const safeName = path.basename(raw);
    if (safeName !== raw || safeName.includes("..")) {
      return send404Html(res);
    }
    const filePath = path.join(viewsRoot, safeName);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(viewsRoot + path.sep) && resolved !== viewsRoot) {
      return send404Html(res);
    }
    res.sendFile(resolved, (err) => {
      if (err) send404Html(res);
    });
  });
}

module.exports = staticFiles;
