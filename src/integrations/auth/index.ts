import { supabase } from "../supabase/client";

type Provider = "google" | "apple" | "azure";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const auth = {
  signInWithOAuth: async (provider: Provider, opts?: SignInOptions) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: opts?.redirect_uri,
        queryParams: opts?.extraParams,
      },
    });

    if (error) {
      return { error };
    }

    return { data };
  },
};