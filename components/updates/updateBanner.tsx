import { useUpdateCheck } from "@/hooks/updates/useUpdatesCheck";
import { useTheme } from "@/hooks/useTheme";
import { downloadAndInstallApk } from "@/utils/updates/installApk";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function UpdateBanner({ isButton }: { isButton?: boolean }) {
    const { update } = useUpdateCheck();
    const { theme } = useTheme();

    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownload = async () => {
        if (!update?.url) return;

        setDownloading(true);
        setProgress(0);

        await downloadAndInstallApk(update.url, (p) => {
            setProgress(p);
        });

        setDownloading(false);
    };

    const percent = Math.round(progress * 100);

    // no update → no banner
    if (!update) return null;

    return (
        <View style={{
            backgroundColor: theme.primary,
            width: isButton ? "90%" : "auto",
            marginHorizontal: isButton ? "auto" : 0,
            borderRadius: isButton ? 8 : 0,
        }}>
            <TouchableOpacity
                onPress={handleDownload}
                style={{
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <Ionicons
                    name="download"
                    color={theme.text}
                    size={18}
                    style={{ marginRight: 8 }}
                />

                <Text
                    style={{ color: theme.text, fontWeight: "700", flex: 1 }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {downloading
                        ? `Downloading… ${percent}%`
                        : `New Update Available • ${update?.version}`}
                </Text>
            </TouchableOpacity>
        </View>
    );
}




// import { useUpdateCheck } from "@/hooks/updates/useUpdatesCheck";
// import { useTheme } from "@/hooks/useTheme";
// import { installApk, resumeDownload, startDownload } from "@/utils/updates/installApk";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useEffect, useState } from "react";
// import { Text, TouchableOpacity } from "react-native";

// export default function UpdateBanner() {
//     const { update } = useUpdateCheck();
//     const { theme } = useTheme();

//     const [progress, setProgress] = useState(0);
//     const [ready, setReady] = useState(false);
//     const [downloading, setDownloading] = useState(false);
//     const [paused, setPaused] = useState(false);

//     // Restore state on mount
//     useEffect(() => {
//         async function load() {
//             const started = await AsyncStorage.getItem("UPDATE_STARTED");
//             const readyFlag = await AsyncStorage.getItem("UPDATE_READY");
//             const pausedFlag = await AsyncStorage.getItem("UPDATE_PAUSED");
//             const prog = await AsyncStorage.getItem("UPDATE_PROGRESS");

//             setDownloading(started === "true");
//             setReady(readyFlag === "true");
//             setPaused(pausedFlag === "true");
//             setProgress(parseFloat(prog || "0"));
//         }
//         load();
//     }, []);

//     if (!update) return null;

//     let label = `New Update Available • ${update.version}`;
//     if (downloading) label = `Downloading… ${Math.round(progress * 100)}%`;
//     if (paused) label = `Download paused — tap to resume`;
//     if (ready) label = `Ready to install — tap to install`;

//     const onPress = async () => {
//         if (ready) return installApk();
//         if (paused) return resumeDownload(setProgress);

//         setDownloading(true);
//         await startDownload(update.url, (p) => setProgress(p));
//     };

//     return (
//         <TouchableOpacity
//             onPress={onPress}
//             style={{
//                 backgroundColor: theme.primary,
//                 paddingVertical: 12,
//                 paddingHorizontal: 20,
//                 flexDirection: "row",
//                 alignItems: "center",
//             }}
//         >
//             <Ionicons
//                 name="download"
//                 color={theme.text}
//                 size={18}
//                 style={{ marginRight: 8 }}
//             />
//             <Text style={{ color: theme.text, fontWeight: "700", flex: 1 }}>
//                 {label}
//             </Text>
//         </TouchableOpacity>
//     );
// }
