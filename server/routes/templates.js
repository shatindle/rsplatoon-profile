const express = require("express");
const router = express.Router();

router.get("/templates", (req, res) => res.json([
    { name: "Splatoon 3 Blue on Yellow", value: "s3-yellow-indigo" },
    { name: "Splatoon 3 Yellow on Blue", value: "s3-indigo-yellow" },
    { name: "Splatoon 3 Callie", value: "s3-callie" },
    { name: "Splatoon 3 Agent 3", value: "s3-agent3" },
    { name: "Splatoon 3 Marie", value: "s3-marie" },
    { name: "Splatoon 2 Green on Pink", value: "s2-pink-green" },
    { name: "Splatoon 2 Pink on Green", value: "s2-green-pink" },
    { name: "Splatoon 2 Firefin on Black", value: "s2-black-firefin" },
    { name: "Splatoon 2 Pink on Sanitized", value: "s2-sanitized-pink" },
    { name: "Splatoon 2 Order on Chaos", value: "s2-chaos-order" },
    { name: "Splatoon 2 Chaos on Order", value: "s2-order-chaos" },
    { name: "Splatoon 2 Octavio", value: "s2-octavio" },
    { name: "Splatoon 1 Blue on Orange", value: "s1-orange-blue" },
    { name: "Splatoon 1 Orange on Blue", value: "s1-blue-orange" },
    { name: "Toni Kensa White on Black", value: "s2-toni-kensa" },
    { name: "Toni Kensa Black on White", value: "s2-toni-kensa-inverted" },
    { name: "Custom Gold on Black", value: "user-black-gold" },
    { name: "Custom Coffee Squid", value: "user-coffee-squid" }
]));

module.exports = router;