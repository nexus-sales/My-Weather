async function test() {
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    const data = await response.json();
    console.log(Object.keys(data));
    console.log(JSON.stringify(data.radar, null, 2).substring(0, 300));
    console.log(JSON.stringify(data.satellite, null, 2));
  } catch (error) {
    console.error(error);
  }
}
test();
