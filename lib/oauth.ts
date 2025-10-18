import { supabase } from "@/utils/supabase";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

const REDIRECT_SCHEME = process.env.EXPO_PUBLIC_REDIRECT_SCHEME;
const REDIRECT_PATH = process.env.EXPO_PUBLIC_REDIRECT_PATH || "auth-callback";

function redirectUri() {
  return AuthSession.makeRedirectUri({
    scheme: REDIRECT_SCHEME,
    path: REDIRECT_PATH,
  });
}

export async function signInWithProvider(provider: "google" | "discord") {
  const redirect = redirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirect,
      skipBrowserRedirect: true,
      queryParams: {
        flow: "pkce",
      },
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("No provider URL from Supabase");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirect);

  if (result.type !== "success" || !result.url) {
    throw new Error(
      result.type === "cancel" ? "Login cancelled" : "Login failed"
    );
  }

  const paramsString = result.url.split("#")[1];
  const params = new URLSearchParams(paramsString);

  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  if (!access_token) throw new Error("No access token returned");
  if (!refresh_token) throw new Error("No refresh token returned");

  const { data: sessionData, error: setErr } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (setErr) throw setErr;
}
