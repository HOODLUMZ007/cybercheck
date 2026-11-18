# CyberCheck History Pilot

This optional desktop Chrome extension checks the saved history of the active browser profile for exact listed hostnames. It covers the first published observation on November 16, 2026 through midnight UTC as a screening window. That cutoff is not an all-clear time.

1. From the repository root, run `python3 scripts/build_extension.py`. Or extract the packaged pilot to a dedicated folder.
2. In desktop Chrome, open `chrome://extensions`, enable Developer mode and use **Load unpacked**. Select `dist-extension` or the extracted folder containing `manifest.json`.
3. Open **CyberCheck History Pilot** from the toolbar. Select **Check my history** and review the Chrome permission request.
4. Results display only an exact hostname and local visit time. The extension attempts to remove the optional permission when the check ends. If interrupted, reopen the extension and use **Clear and revoke access**, or remove the extension from Chrome.

Pilot checks: first deny the permission and verify no check runs. Then allow it, check the results and confirm the permission is removed afterward. Clear results and confirm the list disappears. Use a separate Chrome profile for testing if preferred. The bundled check cannot recover private or deleted history, and Chrome may no longer retain the incident dates.

The search is limited to 10,000 URL records. Local browser APIs may return full URLs to the extension, which compares their hostnames and displays only matches. The extension does not upload or persist history, uses bundled incident data, and has no host or storage permissions. A match does not establish that malicious code ran.
