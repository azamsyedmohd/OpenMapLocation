import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Draw, Modify, Snap } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
// import { createRegularPolygon } from "ol/geom/Polygon";
import { click } from "ol/events/condition";
import { getArea, getLength } from "ol/sphere";

const App = () => {
  const mapRef = useRef(null);
  const [drawType, setDrawType] = useState(null);
  const [measurements, setMeasurements] = useState({});

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    map.addLayer(vectorLayer);

    const draw = new Draw({
      source: vectorSource,
      type: drawType,
      condition: click,
    });

    const modify = new Modify({ source: vectorSource });
    const snap = new Snap({ source: vectorSource });

    map.addInteraction(draw);
    map.addInteraction(modify);
    map.addInteraction(snap);

    draw.on("drawend", (event) => {
      const feature = event.feature;
      let measurement;

      if (drawType === "Polygon") {
        measurement = getArea(feature.getGeometry());
      } else if (drawType === "LineString") {
        measurement = getLength(feature.getGeometry());
      }

      setMeasurements({ [drawType?.toLowerCase()]: measurement });
    });

    // Cleanup function to destroy the map on component unmount
    return () => {
      map.dispose();
    };
  }, [drawType]);

  const handleDrawTypeChange = (type) => {
    setDrawType(type);
    setMeasurements({});
  };

  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: "400px" }}></div>

      <div>
        <button onClick={() => handleDrawTypeChange("Point")}>
          Draw Point
        </button>
        <button onClick={() => handleDrawTypeChange("LineString")}>
          Draw Line
        </button>
        <button onClick={() => handleDrawTypeChange("Polygon")}>
          Draw Polygon
        </button>
      </div>

      {measurements.area && (
        <p>Area: {measurements.area.toFixed(2)} square meters</p>
      )}
      {measurements.length && (
        <p>Length: {measurements.length.toFixed(2)} meters</p>
      )}
    </div>
  );
};

export default App;
