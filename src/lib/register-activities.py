"""ONLY USE THIS FILE TO CREATE A JSON FILE WITH THE ACTIVITIES"""

from datetime import datetime
import json

file = "./public/activities.json"
defaultName = "Cantus"
boj = "BOJ Zaal"
bsg = "BSG zaal"
title = "name"
date = "date"
address = "location"


activities = [
    {
        title: defaultName,
        date: datetime(2025, 10, 8, 20),
        address: "BOJ zaal",
    },
    {title: defaultName, date: datetime(2025, 10, 20, 20), address: boj},
    {title: defaultName, date: datetime(2025, 11, 24, 20), address: boj},
    {
        title: "Rouge-et-vert Cantus",
        date: datetime(2025, 12, 11, 20),
        address: bsg,
    },
    {
        title: "Krambambouli cantus",
        date: datetime(2025, 12, 19, 20),
        address: bsg,
    },
]

activities = list(
    map(
        lambda a: {title: a[title], date: a[date].isoformat(), address: a[address]},
        activities,
    )
)

with open(file, "w") as f:
    json.dump(activities, f, indent=2)
