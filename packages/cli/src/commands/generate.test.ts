import { describe, expect, it } from "vitest";
import { generateCommand } from "./generate.js";

describe("generate command", () => {
  it("has the correct command name", () => {
    expect(generateCommand.name()).toBe("generate");
  });

  it("has required --version option with default r4", () => {
    const versionOpt = generateCommand.options.find((o) => o.long === "--version");
    expect(versionOpt).toBeDefined();
    expect(versionOpt!.defaultValue).toBe("r4");
    expect(versionOpt!.required).toBe(true);
  });

  it("has required --out option", () => {
    const outOpt = generateCommand.options.find((o) => o.long === "--out");
    expect(outOpt).toBeDefined();
    expect(outOpt!.required).toBe(true);
  });

  it("has optional --ig option", () => {
    const igOpt = generateCommand.options.find((o) => o.long === "--ig");
    expect(igOpt).toBeDefined();
    expect(igOpt!.mandatory).toBeFalsy();
  });

  it("has optional --resources option", () => {
    const resOpt = generateCommand.options.find((o) => o.long === "--resources");
    expect(resOpt).toBeDefined();
    expect(resOpt!.mandatory).toBeFalsy();
  });

  it("has optional --src option", () => {
    const srcOpt = generateCommand.options.find((o) => o.long === "--src");
    expect(srcOpt).toBeDefined();
    expect(srcOpt!.mandatory).toBeFalsy();
  });

  it("has optional --cache option", () => {
    const cacheOpt = generateCommand.options.find((o) => o.long === "--cache");
    expect(cacheOpt).toBeDefined();
    expect(cacheOpt!.mandatory).toBeFalsy();
  });

  it("has a description", () => {
    expect(generateCommand.description()).toBeTruthy();
  });
});
