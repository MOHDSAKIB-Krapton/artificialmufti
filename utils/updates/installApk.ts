import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";

const APK_NAME = "artificialmufti-update.apk";
const APK_PATH = FileSystem.documentDirectory + APK_NAME;

/** Check if APK file already downloaded */
export async function isApkDownloaded() {
    try {
        const info = await FileSystem.getInfoAsync(APK_PATH);
        return info.exists && info.size > 0;
    } catch {
        return false;
    }
}

/** Open settings so user can allow "Install unknown apps" */
export async function openUnknownSourcesSettings() {
    return IntentLauncher.startActivityAsync(
        "android.settings.MANAGE_UNKNOWN_APP_SOURCES",
        { data: "package:com.artificialmufti" }
    );
}

/** Attempt to install APK (will fail if permission not granted) */
export async function installApk() {
    try {
        const contentUri = await FileSystem.getContentUriAsync(APK_PATH);

        return await IntentLauncher.startActivityAsync(
            "android.intent.action.INSTALL_PACKAGE",
            {
                data: contentUri,
                flags: 1,
                type: "application/vnd.android.package-archive",
            }
        );
    } catch (err) {
        console.log("INSTALL ERROR:", err);
        throw err;
    }
}

/** Download & install with fallback to settings */
export async function downloadAndInstallApk(
    url: string,
    onProgress?: (p: number) => void
) {
    if (Platform.OS !== "android") return false;

    try {
        // const already = await isApkDownloaded();

        // // STEP 1 — if file already downloaded → skip downloading
        // if (already) {
        //     console.log("APK already exists — skipping download");
        //     return tryInstallationFlow();
        // }

        const dl = FileSystem.createDownloadResumable(
            url,
            APK_PATH,
            {},
            (progress) => {
                const ratio =
                    progress.totalBytesWritten /
                    progress.totalBytesExpectedToWrite;

                if (onProgress) onProgress(ratio);
            }
        );

        const res = await dl.downloadAsync();
        if (!res) throw new Error("Failed to download");

        console.log("APK downloaded:", res.uri);

        return tryInstallationFlow();
    } catch (err) {
        console.log("UPDATE FLOW ERROR:", err);
        return false;
    }
}

/** Handles installation + permission fallback */
async function tryInstallationFlow() {
    try {
        const installRes = await installApk();
        console.log("INSTALL RESULT:", installRes);
        return true;
    } catch (e) {
        console.log("INSTALL FAILED — likely missing permission");

        // Open settings so user can toggle "Allow from this source"
        await openUnknownSourcesSettings();

        return false;
    }
}