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

    const codeMatch = apk.name.match(/-(\d+)\.apk$/);
    const versionCode = codeMatch ? parseInt(codeMatch[1]) : 1;

    // return {
    //   versionName: latest.tag_name,
    //   version: versionCode,
    //   prerelease: latest.prerelease,
    //   updated: latest.published_at,
    //   url: apk.browser_download_url,
    //   sizeMB: (apk.size / 1024 / 1024).toFixed(2),
    // };



    return {
      versionName: "vTEST-1.0.0",   // hardcoded version name
      version: 2,                 // hardcoded versionCode (very high → always triggers update)
      prerelease: false,
      updated: "2025-01-01T00:00:00Z",
      url: "https://github.com/MOHDSAKIB-Krapton/artificialmufti/releases/download/v1.0.0-preview.1/application-f4622f46-380f-42a7-bb93-f22256644354.apk",
      sizeMB: "92.78"
    };

  } catch (e) {
    console.log("GitHub update fetch failed:", e);
    return null;
  }
}
