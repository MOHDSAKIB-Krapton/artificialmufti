import { getLatestRelease } from "@/utils/updates/getLatestRelease";
import { installApk, openUnknownSourcesSettings } from "@/utils/updates/installApk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as FileSystem from "expo-file-system";
import { create } from "zustand";

const APK_PATH = FileSystem.documentDirectory + "artificialmufti-update.apk";
const APK_VERSION_KEY = "downloaded_apk_version";


export interface UpdateInfo {
    version: number;
    versionName: string;
    updated: string;
    url: string;
    alreadyDownloaded?: boolean;
}

export interface UpdateStore {
    update: UpdateInfo | null;
    downloading: boolean;
    installing: boolean;
    progress: number;

    checkForUpdate: () => Promise<void>;
    downloadUpdate: () => Promise<boolean>;
    installUpdate: () => Promise<boolean>;
    safeCleanup: () => Promise<void>;
}


export const useUpdateStore = create<UpdateStore>((set, get) => ({
    update: null,                     // latest update info
    downloading: false,
    installing: false,
    progress: 0,

    /** Fetch update info once */
    checkForUpdate: async () => {
        const latest = await getLatestRelease();
        if (!latest) return;

        const installedBuild = Number(Application.nativeBuildVersion);

        if (latest.version > installedBuild) {
            const exists = await FileSystem.getInfoAsync(APK_PATH);
            const savedVer = await AsyncStorage.getItem(APK_VERSION_KEY);
            const downloadedVersion = savedVer ? Number(savedVer) : 0;

            set({
                update: {
                    ...latest,
                    alreadyDownloaded:
                        exists.exists && downloadedVersion === latest.version,
                },
            });
        }
    },

    /** Download only */
    downloadUpdate: async () => {
        const update = get().update;
        if (!update) return false;

        set({ downloading: true, progress: 0 });

        try {
            const dl = FileSystem.createDownloadResumable(
                update.url,
                APK_PATH,
                {},
                (p) => {
                    const ratio =
                        p.totalBytesWritten / p.totalBytesExpectedToWrite;
                    set({ progress: ratio });
                }
            );

            const res = await dl.downloadAsync();
            if (!res) throw new Error("download failed");

            await AsyncStorage.setItem(APK_VERSION_KEY, String(update.version));

            set({
                downloading: false,
                update: { ...update, alreadyDownloaded: true },
            });

            return true;
        } catch (e) {
            set({ downloading: false });
            return false;
        }
    },

    /** Install only */
    installUpdate: async () => {
        const update = get().update;
        if (!update) return false;

        set({ installing: true });

        try {
            const res = await installApk(APK_PATH);

            console.log("Response after install => ", res);
            set({ installing: false });
            return true;
        } catch (e) {
            set({ installing: false });
            await openUnknownSourcesSettings();
            return false;
        }
    },


    /** CLEANUP LOGIC after install, runs on app launch */
    safeCleanup: async () => {
        try {
            const saved = await AsyncStorage.getItem(APK_VERSION_KEY);
            const savedVersion = Number(saved || 0);

            const currentVersion = Number(Application.nativeBuildVersion);

            // Only cleanup if app updated successfully
            if (savedVersion > 0 && currentVersion >= savedVersion) {
                const apkInfo = await FileSystem.getInfoAsync(APK_PATH);

                if (apkInfo.exists) {
                    await FileSystem.deleteAsync(APK_PATH, { idempotent: true });
                }

                await AsyncStorage.removeItem(APK_VERSION_KEY);
                set({ update: null }); // clear update UI

                console.log("✔ safeCleanup() completed");
            }
        } catch (e) {
            console.log("safeCleanup() error:", e);
        }
    },


}));
