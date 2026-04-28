async function test() {
  const time = Math.floor(Date.now() / 1000) - 600; // 10 mins ago
  const url = `https://tile.rainviewer.com/v2/radar/${time}/256/7/64/42/2/1_1.png`;
  console.log('Testing URL:', url);
  const r = await fetch(url);
  console.log('Status:', r.status);
  console.log('Content-Type:', r.headers.get('content-type'));
}
test();
