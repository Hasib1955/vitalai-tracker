import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oyobaamshxpuxyamwvnr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_smEbxCp5UN4Tg8nXZr_ZOA_ddC6I_MK";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
