
async function testAemetCatalog() {
  const apiKey = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzYWx2YWRvci5tdW5vekBtYXN2b2lwLmNvbSIsImp0aSI6IjYxZDcwNDZkLTUzZjMtNDBmZC1hNjA5LWFmZDRlNjM2NWJhNyIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzc3MjMwNjIzLCJ1c2VySWQiOiI2MWQ3MDQ2ZC01M2YzLTQwZmQtYTYwOS1hZmQ0ZTYzNjViYTciLCJyb2xlIjoiIn0.GhiAFhsho__xjt5nTShnsWvq5xDbmEdMul3Is5eMA7k";
  
  const url = `https://opendata.aemet.es/opendata/api/catalogomapa?api_key=${apiKey}`;
  console.log(`\nTesting Catalog: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log(`Response keys: ${Object.keys(data)}`);
    if (data.datos) {
        const datosRes = await fetch(data.datos);
        const catalog = await datosRes.json();
        console.log(`Catalog size: ${catalog.length}`);
        const radarItems = catalog.filter(item => item.id.includes('radar'));
        console.log(`Radar items in catalog:`, radarItems.map(i => ({id: i.id, descripcion: i.descripcion})));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testAemetCatalog();
