export async function getLatestRelease() {
  try {
    const res = await fetch(
      "https://github.com/MOHDSAKIB-Krapton/artificialmufti/releases/latest/download/metadata.json",
      { method: "GET", headers: { "Accept": "application/vnd.github+json" } }
    );

    const release = await res.json();

    return {
      versionName: release.versionName,
      version: Number(release.versionCode),
      updated: release.publishedAt,
      url: release.apkUrl,
    };

  } catch (e) {
    console.log("GitHub update fetch failed:", e);
    return null;
  }
}
