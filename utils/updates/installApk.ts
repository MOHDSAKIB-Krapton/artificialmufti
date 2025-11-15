import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";

export async function downloadAndInstallApk(url: string, onProgress?: (p: number) => void) {
    try {
        const path = FileSystem.documentDirectory + "artificialmufti-update.apk";

        const dl = FileSystem.createDownloadResumable(
            url,
            path,
            {},
            (progress) => {
                const ratio =
                    progress.totalBytesWritten /
                    progress.totalBytesExpectedToWrite;

                if (onProgress) onProgress(ratio);
            }
        );

        const res = await dl.downloadAsync();
        console.log("APK downloaded:", res?.uri);

        if (!res) return false;

        await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
                data: "file://" + path,
                flags: 1,
                type: "application/vnd.android.package-archive",
            }
        );

        await FileSystem.deleteAsync(path, { idempotent: true });
        return true;
    } catch (err) {
        console.log("APK installation error:", err);
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
