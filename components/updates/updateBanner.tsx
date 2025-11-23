import { useUpdateCheck } from "@/hooks/updates/useUpdatesCheck";
import { useTheme } from "@/hooks/useTheme";
import { downloadAndInstallApk } from "@/utils/updates/installApk";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";


export default function UpdateBanner({ isButton }: { isButton?: boolean }) {
    const { update, setUpdate } = useUpdateCheck();
    const { theme } = useTheme();

    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownload = async () => {
        if (!update?.url) return;

        setDownloading(true);
        setProgress(0);

        console.log("alreadyDownloaded => ", update);

        const success = await downloadAndInstallApk(update.url, update.version, (p) => {
            setProgress(p);
        }, () => {
            setDownloading(false);
            setUpdate((prev: any) => ({ ...prev, alreadyDownloaded: true }));
        }, (e) => {
            console.log("UPDATE FLOW ERROR:", e);
            setDownloading(false);
        });

        if (success) {

        } else {
            // failed → reset progress
            setProgress(0);
        }
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
                disabled={downloading}
                onPress={handleDownload}
                style={{
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                {
                    downloading ? (
                        <ActivityIndicator size={"small"} color={theme.text} />
                    ) : (
                        <Ionicons
                            name="download"
                            color={theme.text}
                            size={18}
                            style={{ marginRight: 8 }}
                        />
                    )
                }


                <Text
                    className="text-center"
                    style={{ color: theme.text, fontWeight: "700", flex: 1 }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {downloading
                        ? `Downloading… ${percent}%`
                        : update.alreadyDownloaded ? "Install Update" : "Download Update"
                    }
                </Text>
            </TouchableOpacity>
        </View>
    );
}