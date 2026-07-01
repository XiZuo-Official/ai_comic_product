import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4000);

function jsonResponse(statusCode: number, payload: Record<string, unknown>) {
  return {
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json; charset=utf-8"
    },
    statusCode
  };
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && (url.pathname === "/health" || url.pathname === "/v1/health")) {
    const result = jsonResponse(200, {
      ok: true,
      service: "api",
      version: "v1"
    });

    response.writeHead(result.statusCode, result.headers);
    response.end(result.body);
    return;
  }

  const result = jsonResponse(404, {
    error: "Not found"
  });

  response.writeHead(result.statusCode, result.headers);
  response.end(result.body);
});

server.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
