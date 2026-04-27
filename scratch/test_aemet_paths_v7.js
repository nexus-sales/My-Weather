
async function testAemetPathsV7() {
  const apiKey = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzYWx2YWRvci5tdW5vekBtYXN2b2lwLmNvbSIsImp0aSI6IjYxZDcwNDZkLTUzZjMtNDBmZC1hNjA5LWFmZDRlNjM2NWJhNyIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzc3MjMwNjIzLCJ1c2VySWQiOiI2MWQ3MDQ2ZC01M2YzLTQwZmQtYTYwOS1hZmQ0ZTYzNjViYTciLCJyb2xlIjoiIn0.GhiAFhsho__xjt5nTShnsWvq5xDbmEdMul3Is5eMA7k";
  
  const paths = [
    'mapasygraficos/analisis/radar/nacional',
    'mapasygraficos/prediccion/radar/nacional',
    'observacion/radar/2d/nacional'
  ];
  
  for (const path of paths) {
    const url = `https://opendata.aemet.es/opendata/api/${path}?api_key=${apiKey}`;
    console.log(`\nTesting: ${url}`);
    try {
      const res = await fetch(url);
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Response (first 200): ${text.substring(0, 200)}`);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }
}

testAemetPathsV7();
