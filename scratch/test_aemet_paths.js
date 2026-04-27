
async function testAemetPaths() {
  const apiKey = process.env.AEMET_API_KEY;
  if (!apiKey) {
    console.error('No API key');
    return;
  }
  
  const paths = [
    'observacion/radar/2d/comun/nacional',
    'prediccion/maritima/costera/area/esp',
    'observacion/convencional/todas'
  ];
  
  for (const path of paths) {
    const url = `https://opendata.aemet.es/opendata/api/${path}?api_key=${apiKey}`;
    console.log(`Testing: ${url}`);
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    const json = await res.json();
    console.log(`Response: ${JSON.stringify(json).substring(0, 200)}...`);
  }
}

testAemetPaths();
