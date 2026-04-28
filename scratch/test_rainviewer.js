async function test() {
  const r = await fetch('https://api.rainviewer.com/public/weather-maps.json');
  const data = await r.json();
  console.log('Host:', data.host);
  console.log('First radar frame:', data.radar.past[0]);
}
test();
