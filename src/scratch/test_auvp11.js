async function testAUVP11() {
  const token = '6TbHWbEPR3BtQvTgrXyc3q';
  try {
    const res1 = await fetch(`https://brapi.dev/api/quote/AUVP11?range=1d&interval=15m&token=${token}`);
    const d1 = await res1.json();
    console.log('AUVP11 15m:', d1.results?.[0]?.historicalDataPrice?.length);

    const res2 = await fetch(`https://brapi.dev/api/quote/AUVP11?range=3mo&interval=1d&token=${token}`);
    const d2 = await res2.json();
    console.log('AUVP11 1d:', d2.results?.[0]?.historicalDataPrice?.length);
  } catch (e) {
    console.error(e);
  }
}
testAUVP11();
