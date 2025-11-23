import { useUpdateStore } from "@/store/update.store";
import { useEffect } from "react";

export function UpdateProvider({ children }: { children: React.ReactNode }) {
    const safeCleanup = useUpdateStore((s) => s.safeCleanup);
    const checkForUpdate = useUpdateStore((s) => s.checkForUpdate);

    useEffect(() => {
        (async () => {
            await safeCleanup();      // cleanup leftover APK after install
            await checkForUpdate();   // refresh update info
        })();
    }, []);

    return children;
}
