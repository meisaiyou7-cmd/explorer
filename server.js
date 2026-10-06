const http = require("node:http");

const PORT = process.env.PORT || 3000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/observations") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        const isValidSchema =
          data &&
          typeof data.session_id === "string" &&
          data.session_id.trim() !== "" &&
          typeof data.observation === "object" &&
          data.observation !== null;

        if (!isValidSchema) {
          console.warn(
            "構造不適合のリクエストを受信:",
            data
          );

          res.writeHead(400, {
            "Content-Type": "application/json",
            ...corsHeaders,
          });

          res.end(JSON.stringify({
            status: "error",
            message:
              "Invalid observation payload format"
          }));

          return;
        }

        console.log("========================================");
        console.log("2847 AI司令室：観測データを受信");
        console.log("時刻:", new Date().toISOString());
        console.log("session_id:", data.session_id);
        console.log(
          "observation:",
          JSON.stringify(data.observation, null, 2)
        );
        console.log("========================================");

        res.writeHead(200, {
          "Content-Type": "application/json",
          ...corsHeaders,
        });

        res.end(JSON.stringify({
          status: "ok",
          message:
            "Observation received by Command Center"
        }));

      } catch (err) {
        console.error(
          "不正なJSONデータ:",
          err.message
        );

        res.writeHead(400, {
          "Content-Type": "application/json",
          ...corsHeaders,
        });

        res.end(JSON.stringify({
          status: "error",
          message: "Invalid JSON format"
        }));
      }
    });

    return;
  }

  res.writeHead(404, {
    "Content-Type": "application/json",
    ...corsHeaders,
  });

  res.end(JSON.stringify({
    status: "error",
    message: "Endpoint not found"
  }));
});

server.listen(PORT, () => {
  console.log(
    `2847 AI司令室 最小サーバー起動 Port: ${PORT}`
  );
});
