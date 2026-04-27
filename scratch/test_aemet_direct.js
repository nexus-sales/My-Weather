
async function testAemetDirectImage() {
  const url = "https://www.aemet.es/imagenes_d/eltiempo/observacion/radar/r8n_24_8bit.gif";
  console.log(`\nTesting Direct Image: ${url}`);
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`Status: ${res.status}`);
    console.log(`Content-Type: ${res.headers.get('content-type')}`);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testAemetDirectImage();
