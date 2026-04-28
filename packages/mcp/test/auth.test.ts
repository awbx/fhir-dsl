import { describe, expect, it } from "vitest";
import { createAuthResolver } from "../src/auth.js";

describe("createAuthResolver", () => {
  it("returns empty headers when no strategy is set", async () => {
    const resolver = createAuthResolver(undefined);
    expect(await resolver.authorize()).toEqual({});
  });

  it("formats a static bearer token", async () => {
    const resolver = createAuthResolver({ kind: "bearer", token: "abc.def.ghi" });
    expect(await resolver.authorize()).toEqual({ Authorization: "Bearer abc.def.ghi" });
  });

  it("calls a thunk for dynamic bearer tokens", async () => {
    let calls = 0;
    const resolver = createAuthResolver({
      kind: "bearer",
      token: () => {
        calls++;
        return `tok-${calls}`;
      },
    });
    expect((await resolver.authorize()).Authorization).toBe("Bearer tok-1");
    expect((await resolver.authorize()).Authorization).toBe("Bearer tok-2");
  });

  it("defers backend-services to a follow-up phase via a clear error", async () => {
    const resolver = createAuthResolver({
      kind: "backend-services",
      tokenUrl: "https://example/token",
      clientId: "client",
      privateKey: "-----BEGIN PRIVATE KEY-----\nx\n-----END PRIVATE KEY-----",
    });
    await expect(resolver.authorize()).rejects.toThrow(/backend-services auth is wired in a later phase/);
  });
});
