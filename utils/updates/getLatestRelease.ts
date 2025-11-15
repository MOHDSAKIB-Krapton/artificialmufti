export async function getLatestRelease() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/MOHDSAKIB-Krapton/artificialmufti/releases",
      { method: "GET", headers: { "Accept": "application/vnd.github+json" } }
    );

    const releases = await res.json();
    const latest = releases[0];

    const apk = latest.assets.find(
      (a: any) => a.content_type === "application/vnd.android.package-archive"
    );

    return {
      version: latest.tag_name,
      prerelease: latest.prerelease,
      updated: latest.published_at,
      url: apk.browser_download_url,
      sizeMB: (apk.size / 1024 / 1024).toFixed(2),
    };
  } catch (e) {
    console.log("GitHub update fetch failed:", e);
    return null;
  }
}
