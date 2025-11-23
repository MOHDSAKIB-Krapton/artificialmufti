import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";

/** Open settings so user can allow "Install unknown apps" */
export async function openUnknownSourcesSettings() {
    return IntentLauncher.startActivityAsync(
        "android.settings.MANAGE_UNKNOWN_APP_SOURCES",
        { data: "package:com.artificialmufti" }
    );
}

/** Attempt to install APK (will fail if permission not granted) */
export async function installApk(APK_PATH: string) {
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