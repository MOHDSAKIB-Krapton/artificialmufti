import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";

const APK_NAME = "artificialmufti-update.apk";
const APK_PATH = FileSystem.documentDirectory + APK_NAME;
const APK_VERSION_KEY = "downloaded_apk_version";

/** Check if APK file already downloaded */
export async function isApkDownloaded(remoteVersion: number) {
    try {
        const info = await FileSystem.getInfoAsync(APK_PATH);
        if (!info.exists || info.size === 0) return false;

        const savedVersion = await AsyncStorage.getItem(APK_VERSION_KEY);
        const downloadedVersion = savedVersion ? Number(savedVersion) : 0;

        console.log("Saved version => ", downloadedVersion, typeof downloadedVersion);
        console.log("Remote version => ", remoteVersion, typeof remoteVersion);
        console.log("Already downloaded => ", downloadedVersion === remoteVersion);

        return downloadedVersion === remoteVersion;
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
    remoteVersion: number,
    onProgress?: (p: number) => void,
    onComplete?: () => void,
    onError?: (e: any) => void,
) {
    if (Platform.OS !== "android") return false;

    try {

        // Step 1 — If this version is already downloaded → install immediately
        const already = await isApkDownloaded(remoteVersion);
        if (already) {
            console.log("APK already exists — installing directly");
            return await tryInstallationFlow();
        }

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

        await AsyncStorage.setItem(APK_VERSION_KEY, String(remoteVersion));
        if (onComplete) onComplete();

        console.log("APK downloaded:", res.uri);

        return tryInstallationFlow();
    } catch (err) {
        console.log("UPDATE FLOW ERROR:", err);
        if (onError) onError(err);
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