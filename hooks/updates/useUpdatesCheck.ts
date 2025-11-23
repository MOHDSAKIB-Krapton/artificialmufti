import { getLatestRelease } from "@/utils/updates/getLatestRelease";
import { isApkDownloaded } from "@/utils/updates/installApk";
import * as Application from "expo-application";
import { useEffect, useState } from "react";

export function useUpdateCheck() {
  const [update, setUpdate] = useState<any>(null);

  useEffect(() => {
    async function check() {
      const latest = await getLatestRelease();

      if (!latest) return;

      // Basic version comparison
      if (latest.version > Number(Application.nativeBuildVersion)) {

        const alreadyDownloaded = await isApkDownloaded(latest.version);
        console.log("Already Downloaded => ", alreadyDownloaded);
        setUpdate({
          ...latest,
          alreadyDownloaded
        });
      }

    }

    check();
  }, []);

  return { update, setUpdate };
}
