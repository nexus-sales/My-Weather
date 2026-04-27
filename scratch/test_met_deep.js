
async function testMetEireannDeep() {
  const lat = 53.3498;
  const lon = -6.2603;
  const url = `http://openaccess.pf.api.met.ie/metno-wdb2ts/locationforecast?lat=${lat};long=${lon}`;
  
  const res = await fetch(url);
  const text = await res.text();
  console.log(text.substring(0, 5000));
}

testMetEireannDeep();
