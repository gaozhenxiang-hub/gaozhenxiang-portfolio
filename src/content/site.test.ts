import { describe, expect, it } from "vitest";

import { siteContent } from "./site";

describe("siteContent", () => {
  it("uses the approved personal identity", () => {
    expect(siteContent.name).toBe("高振翔");
    expect(siteContent.tagline).toBe("AIGC CREATOR");
  });

  it("uses the approved contact details", () => {
    expect(siteContent.phone).toBe("13293941800");
    expect(siteContent.email).toBe("13293941800@163.com");
  });
});
