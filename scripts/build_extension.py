"""Package the desktop Chrome pilot with local, bundled incident data."""
from pathlib import Path
from shutil import copy2

root = Path(__file__).resolve().parents[1]
target = root / "dist-extension"
for name in ("extension", "src", "data"):
    (target / name).mkdir(parents=True, exist_ok=True)
copy2(root / "extension/manifest.json", target / "manifest.json")
for name in ("launch.js", "history.js", "popup.html", "popup.css", "popup.js"):
    copy2(root / "extension" / name, target / "extension" / name)
copy2(root / "src/assessment.js", target / "src/assessment.js")
copy2(root / "public/data/incident.json", target / "data/incident.json")
print(f"Load unpacked from {target}")
