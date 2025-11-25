export async function handler(event) {
    try {
        const url = event.queryStringParameters?.url;

        if (!url) {
            return sendError(400, "Missing URL");
        }

        if (!/^https?:\/\/.+/.test(url)) {
            return sendError(400, "Invalid URL format");
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(url, { signal: controller.signal });

        clearTimeout(timeout);

        if (!res.ok) {
            return sendError(res.status, `Remote server responded ${res.status}`);
        }

        const content = await res.text();
        const filename = url.split("/").pop() || "file.txt";

        return {
            statusCode: 200,
            body: JSON.stringify({ filename, content })
        };
    } catch (err) {
        return sendError(500, "Fetch failed or timed out");
    }
}

function sendError(status, message) {
    return {
        statusCode: status,
        body: JSON.stringify({ error: message })
    };
}
