async function getChosicToken() {
  try {
    const response = await fetch("https://www.chosic.com/api/tools/t/", {
      method: "POST",
      headers: {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-IN,en;q=0.9",
        "App": "playlist_analyzer",
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": "pll_language=en; r_c1062550=1757739782%7Cafa8601eba8202ee%7C7fe41820b730e20ee57afbbfa235f4aee626c03a3085db076ddcb8a29cb196a",
        "Origin": "https://www.chosic.com",
        "Pragma": "no-cache",
        "Priority": "u=1, i",
        "Referer": "https://www.chosic.com/spotify-playlist-analyzer/",
        "Sec-Ch-Ua": "\"Chromium\";v=\"140\", \"Not-A?Brand\";v=\"24\", \"Brave\";v=\"140\"",
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": "\"Android\"",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Gpc": "1",
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: "app=playlist_analyzer"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const raw = await response.text();


    // 🔥 Clean up escaped quotes
    const clean = raw.replace(/\\"/g, '"');

    // ✅ Extract token
    const tokenMatch = clean.match(/"token"\s*:\s*"([^"]+)"/);
    const token = tokenMatch ? tokenMatch[1] : null;

    // ✅ Extract time (in seconds)
    const timeMatch = clean.match(/"time"\s*:\s*(\d+)/);
    const timeSec = timeMatch ? parseInt(timeMatch[1], 10) : 0;

    // ✅ Expiry timestamp
    const expiresAt = Date.now() + timeSec * 1000;


    return token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return { token: null, expiresAt: null };
  }
}

export default getChosicToken;
