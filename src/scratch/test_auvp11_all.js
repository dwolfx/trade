async function testAUVP11All() {
  const token = '6TbHWbEPR3BtQvTgrXyc3q';
  const attempts = [
    { range: '5d', interval: '15m' },
    { range: '1d', interval: '15m' },
    { range: '5d', interval: '60m' },
    { range: '1mo', interval: '1d' },
    { range: '3mo', interval: '1d' },
    { range: '1y', interval: '1wk' }
  ];
  for (const a of attempts) {
    const res = await fetch(`https://brapi.dev/api/quote/AUVP11?range=${a.range}&interval=${a.interval}&token=${token}`);
    const d = await res.json();
    console.log(`AUVP11 range=${a.range} int=${a.interval} -> bars:`, d.results?.[0]?.historicalDataPrice?.length);
  }
}
testAUVP11All();
