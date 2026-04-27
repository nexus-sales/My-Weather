
async function testMetEireann() {
  const lat = 53.3498;
  const lon = -6.2603;
  const url = `http://openaccess.pf.api.met.ie/metno-wdb2ts/locationforecast?lat=${lat};long=${lon}`;
  
  console.log(`Fetching: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response length: ${text.length}`);
    console.log(`First 500 chars: ${text.substring(0, 500)}`);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testMetEireann();
