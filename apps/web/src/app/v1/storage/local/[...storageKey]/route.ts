import { readStoredObject } from "@ai-comic/storage";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ storageKey: string[] }> }) {
  try {
    const { storageKey } = await params;
    const storedObject = await readStoredObject({
      storageKey: storageKey.join("/"),
      storageProvider: "local"
    });
    const body = new ArrayBuffer(storedObject.body.byteLength);
    new Uint8Array(body).set(storedObject.body);

    return new NextResponse(body, {
      headers: {
        "Content-Type": storedObject.contentType
      }
    });
  } catch {
    return NextResponse.json({ error: "Stored object not found" }, { status: 404 });
  }
}
