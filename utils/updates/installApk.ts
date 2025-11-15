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
        const already = await isApkDownloaded();

        // STEP 1 — if file already downloaded → skip downloading
        if (already) {
            console.log("APK already exists — skipping download");
            return tryInstallationFlow();
        }

        console.log("Downloading new APK:", url);

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


// import * as FileSystem from "expo-file-system";
// // import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// let downloadResumable: FileSystem.DownloadResumable | null = null;

// export async function startDownload(url: string, onProgress?: (p: number) => void) {
//     try {
//         const path = FileSystem.documentDirectory + "artificialmufti-update.apk";

//         await AsyncStorage.multiSet([
//             ["UPDATE_STARTED", "true"],
//             ["UPDATE_READY", "false"],
//             ["UPDATE_PROGRESS", "0"],
//             ["UPDATE_FILE_PATH", path],
//         ]);

//         downloadResumable = FileSystem.createDownloadResumable(
//             url,
//             path,
//             {},
//             (progress) => {
//                 const ratio =
//                     progress.totalBytesWritten /
//                     progress.totalBytesExpectedToWrite;

//                 AsyncStorage.setItem("UPDATE_PROGRESS", ratio.toString());
//                 onProgress?.(ratio);
//             }
//         );

//         const result = await downloadResumable.downloadAsync();
//         if (!result) return false;

//         await AsyncStorage.multiSet([
//             ["UPDATE_READY", "true"],
//             ["UPDATE_STARTED", "false"],
//         ]);

//         return true;
//     } catch (err) {
//         console.log("Download error:", err);
//         return false;
//     }
// }

// export async function pauseDownload() {
//     if (!downloadResumable) return false;

//     try {
//         const snapshot = await downloadResumable.pauseAsync();
//         await AsyncStorage.setItem("UPDATE_PAUSED_SNAPSHOT", JSON.stringify(snapshot));

//         await AsyncStorage.setItem("UPDATE_PAUSED", "true");
//         await AsyncStorage.setItem("UPDATE_STARTED", "false");

//         return true;
//     } catch (e) {
//         console.log("Pause error:", e);
//         return false;
//     }
// }

// export async function resumeDownload(onProgress?: (p: number) => void) {
//     try {
//         const snapshot = await AsyncStorage.getItem("UPDATE_PAUSED_SNAPSHOT");
//         if (!snapshot) return false;

//         const data = JSON.parse(snapshot);
//         const path = await AsyncStorage.getItem("UPDATE_FILE_PATH");

//         downloadResumable = new FileSystem.DownloadResumable(
//             data.url,
//             path!,
//             {},
//             (progress) => {
//                 const ratio =
//                     progress.totalBytesWritten /
//                     progress.totalBytesExpectedToWrite;

//                 AsyncStorage.setItem("UPDATE_PROGRESS", ratio.toString());
//                 onProgress?.(ratio);
//             },
//             data
//         );

//         await AsyncStorage.setItem("UPDATE_STARTED", "true");
//         await AsyncStorage.setItem("UPDATE_PAUSED", "false");

//         const result = await downloadResumable.resumeAsync();

//         if (result) {
//             await AsyncStorage.setItem("UPDATE_READY", "true");
//         }

//         return true;
//     } catch (err) {
//         console.log("Resume error:", err);
//         return false;
//     }
// }

// export async function installApk() {
//     try {
//         const path = await AsyncStorage.getItem("UPDATE_FILE_PATH");
//         if (!path) return false;

//         // await IntentLauncher.startActivityAsync(
//         //   "android.intent.action.VIEW",
//         //   {
//         //     data: "file://" + path,
//         //     type: "application/vnd.android.package-archive",
//         //     flags: 1,
//         //   }
//         // );

//         return true;
//     } catch (err) {
//         console.log("Install error:", err);
//         return false;
//     }
// }

// export async function cleanupUpdateData() {
//     await AsyncStorage.multiRemove([
//         "UPDATE_STARTED",
//         "UPDATE_PROGRESS",
//         "UPDATE_READY",
//         "UPDATE_FILE_PATH",
//         "UPDATE_PAUSED",
//         "UPDATE_PAUSED_SNAPSHOT",
//     ]);
// }
