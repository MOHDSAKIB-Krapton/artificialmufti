export async function getLatestRelease() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/MOHDSAKIB-Krapton/artificialmufti/releases/latest/download/metadata.json",
      { method: "GET", headers: { "Accept": "application/vnd.github+json" } }
    );

    const releases = await res.json();
    // const latest = releases[0];

    console.log("Release => ", releases);
    // console.log("Latest Release => ", latest);



    // // Extract APK URL from release body
    // const body = latest.body || "";
    // const urlMatch = body.match(/Artifact URL:\s*(https?:\/\/\S+)/);
    // const apkUrl = urlMatch ? urlMatch[1] : null;

    // if (!apkUrl) {
    //   console.log("APK URL not found in release body");
    //   return null;
    // }

    // // Extract versionCode from tag (v1.0.0+3)
    // const tag = latest.tag_name; // "v1.0.0+3"
    // const versionCodeMatch = tag.match(/\+(\d+)$/);
    // const versionCode = versionCodeMatch ? parseInt(versionCodeMatch[1]) : 1;

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
