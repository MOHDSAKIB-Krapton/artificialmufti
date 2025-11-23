import { useTheme } from "@/hooks/useTheme";
import { useUpdateStore } from "@/store/update.store";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";


export default function UpdateBanner() {
    const { theme } = useTheme();
    // const { update, setUpdate } = useUpdateCheck();

    // const [progress, setProgress] = useState(0);
    // const [downloading, setDownloading] = useState(false);
    // const [installing, setInstalling] = useState(false);


    // // no update → no banner
    // if (!update) return null;

    // const handleDownload = async () => {
    //     setDownloading(true);
    //     setProgress(0);

    //     const success = await downloadAPK(update.url, update.version, (p: number) => {
    //         setProgress(p);
    //     });

    //     setDownloading(false);
    //     if (success) {
    //         setUpdate((u: any) => ({ ...u, alreadyDownloaded: true }));
    //     }
    // };

    // const handleInstall = async () => {
    //     setInstalling(true);

    //     const ok = await installDownloadedAPK();
    //     setInstalling(false);

    //     if (ok) {
    //         console.log("Installed successfully");
    //     }
    // };


    const update = useUpdateStore((s) => s.update);
    const downloading = useUpdateStore((s) => s.downloading);
    const installing = useUpdateStore((s) => s.installing);
    const progress = useUpdateStore((s) => s.progress);
    const downloadUpdate = useUpdateStore((s) => s.downloadUpdate);
    const installUpdate = useUpdateStore((s) => s.installUpdate);

    if (!update) return null;

    const isDownloaded = update.alreadyDownloaded;

    const handlePress = () => {
        if (isDownloaded) installUpdate();
        else downloadUpdate();
    };

    const percent = Math.round(progress * 100);

    let label = "Download New Update";

    if (downloading) label = `Downloading… ${percent}%`;
    else if (installing) label = "Installing…";
    else if (isDownloaded) label = "Install New Update";


    return (
        <TouchableOpacity
            disabled={downloading || installing}
            onPress={handlePress}
            style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.primary,
                width: "90%",
                marginHorizontal: "auto",
                borderRadius: 8,
            }}
        >
            {downloading ? (
                <ActivityIndicator size="small" color={theme.text} />
            ) : (
                <Ionicons
                    name={isDownloaded ? "arrow-down-circle" : "download"}
                    color={theme.text}
                    size={18}
                    style={{ marginRight: 8 }}
                />
            )}


            <Text
                className="text-center"
                style={{ color: theme.text, fontWeight: "700", }}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}