import { useEffect, useRef } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

export function useDrawPerimeter(mapRef, isMapLoaded, onPerimeterDrawn) {
  const drawRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: "simple_select",
    });

    map.addControl(draw, "top-right");
    drawRef.current = draw;

    const handleCreate = (e) => {
      const feature = e.features[0];
      if (feature) {
        onPerimeterDrawn(feature);
        draw.changeMode("simple_select");
      }
    };

    map.on("draw.create", handleCreate);

    return () => {
      map.off("draw.create", handleCreate);
      try {
        if (drawRef.current && mapRef.current) {
          mapRef.current.removeControl(drawRef.current);
        }
      } catch (_) {
        // map already removed
      }
      drawRef.current = null;
    };
  }, [mapRef, isMapLoaded, onPerimeterDrawn]);

  const startDrawing = () => {
    drawRef.current?.changeMode("draw_polygon");
  };

  const clearPerimeter = () => {
    drawRef.current?.deleteAll();
  };

  return { startDrawing, clearPerimeter };
}
