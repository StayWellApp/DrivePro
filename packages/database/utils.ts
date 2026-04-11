import * as wkx from "wkx";

export function mapGeometryToGeoJSON(
  geometry: Buffer | string | null,
): any | null {
  if (!geometry) {
    return null;
  }

  try {
    const buf =
      typeof geometry === "string" ? Buffer.from(geometry, "hex") : geometry;
    const geometryObj = wkx.Geometry.parse(buf);
    return geometryObj.toGeoJSON();
  } catch (error) {
    console.error("Error parsing geometry to GeoJSON:", error);
    return null;
  }
}
