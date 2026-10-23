async function testYahooAUVP() {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/AUVP11.SA?interval=15m&range=5d', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const d = await res.json();
    const timestamps = d.chart?.result?.[0]?.timestamp;
    console.log('Yahoo AUVP11 15m timestamps:', timestamps?.length);
  } catch (e) {
    console.error(e);
  }
}
testYahooAUVP();
