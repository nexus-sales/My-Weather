
async function testMetEireannHttps() {
  const lat = 53.3498;
  const lon = -6.2603;
  const url = `https://openaccess.pf.api.met.ie/metno-wdb2ts/locationforecast?lat=${lat};long=${lon}`;
  
  console.log(`Fetching: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testMetEireannHttps();
