import { getLatestRelease } from "@/utils/updates/getLatestRelease";
import { useEffect, useState } from "react";

export const APP_VERSION = "v1.0.0-preview.2";

export function useUpdateCheck() {
  const [update, setUpdate] = useState<any>(null);

  useEffect(() => {
    async function check() {
      const latest = await getLatestRelease();

      if (!latest) return;

      // Basic version comparison
      if (latest.version !== APP_VERSION) {
        setUpdate(latest);
      }

    }

    check();
  }, []);

  return { update };
}
