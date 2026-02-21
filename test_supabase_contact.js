require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Table exists! Data:", data);
    }
}

checkTable();
