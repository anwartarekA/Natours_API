/* eslint-disable */
export const displayMap = (locations, map) => {
  // make bounds for the map
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';
    // add marker to map
    new mapboxgl.Marker({
      Element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    // extend map bounds to include the current location
    bounds.extend(loc.coordinates);
    // add pop up to see the description of the location
    new mapboxgl.Popup({
      offset: 55,
    })
      .setLngLat(loc.coordinates)
      .setHTML(
        `<p style='color:gray; font-size:15px'>Day ${loc.day}:${loc.description}</p>`,
      )
      .addTo(map);
  });

  // map to fit the bounds
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      left: 100,
      right: 100,
      bottom: 200,
    },
  });
};
