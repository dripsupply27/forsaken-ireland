import LocationCard from "./LocationCard";

export default function LocationList({ locations, onSelectLocation, onFlyTo }) {
  if (locations.length === 0) {
    return (
      <div style={{
        padding: 24,
        textAlign: "center",
        color: "#444",
        fontSize: 11
      }}>
        NO LOCATIONS FOUND
      </div>
    );
  }

  return (
    <>
      {locations.map(loc => (
        <LocationCard
          key={loc.id}
          location={loc}
          onSelect={onSelectLocation}
          onFlyTo={onFlyTo}
        />
      ))}
    </>
  );
}
