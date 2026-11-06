import { describe, expect, it } from "vitest";
import {
  getMetaDescription,
  getMetaTitle,
  getSEOMetadata,
  normalizeRoute,
  vanirSeoMatrix,
} from "./seoMatrix";

describe("seoMatrix helpers", () => {
  it("contains the expected route entries including 6 priority blog guides", () => {
    expect(Object.keys(vanirSeoMatrix).length).toBeGreaterThanOrEqual(29);
  });

  it("returns metadata for exact routes with target keywords", () => {
    expect(getMetaTitle("/")).toContain("Luxury Travel Concierge");
    expect(getMetaDescription("/")).toContain("luxury travel concierge service");
    expect(getMetaTitle("/destinations/egypt")).toContain("Luxury Egypt Tours");
    expect(getMetaDescription("/destinations/egypt")).toContain("luxury Egypt tours");
    expect(getMetaTitle("/private-jet")).toContain("Privatjet Mieten");
    expect(getMetaTitle("/about")).toContain("Ahmed Roshdi");
    expect(getMetaDescription("/news")).toContain("The Vanir Chronicle");
  });

  it("resolves metadata for key production routes and priority blog posts", () => {
    const routes = [
      "/",
      "/about",
      "/hotels",
      "/day-trips",
      "/private-jet",
      "/visa",
      "/packages",
      "/destinations/egypt",
      "/destinations/dubai",
      "/destinations/italy",
      "/blog/what-does-a-luxury-travel-concierge-do",
      "/blog/private-jet-charter-guide-how-to-book-costs",
      "/blog/luxury-travel-agency-vs-concierge-service",
      "/blog/egypt-luxury-travel-guide-private-tours-nile-cruises",
      "/blog/best-private-islands-maldives-retreats-uhnw",
      "/blog/how-to-plan-bespoke-european-vacation-luxury-concierge",
    ];
    for (const route of routes) {
      const seo = getSEOMetadata(route);
      expect(seo).not.toBeNull();
      expect(getMetaTitle(route)).toBeTruthy();
      expect(getMetaDescription(route)).toBeTruthy();
      expect(seo?.sections?.length).toBeGreaterThan(0);
      expect(seo?.images?.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("normalizes routes before lookup", () => {
    expect(normalizeRoute("/hotels/?source=ad#hero")).toBe("/hotels");
    expect(getSEOMetadata("/hotels/?source=ad#hero")?.route).toBe("/hotels");
  });

  it("falls back destination sub-routes to the destination root metadata", () => {
    expect(getSEOMetadata("/destinations/dubai/hotels")?.route).toBe("/destinations/dubai");
  });

  it("returns null for unknown routes", () => {
    expect(getSEOMetadata("/not-in-matrix")).toBeNull();
  });
});

