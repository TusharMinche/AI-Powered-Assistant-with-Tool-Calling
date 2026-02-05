import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function cleanupConversations() {
    const sql = neon(process.env.DATABASE_URL!);

    // Delete messages from conversations with title "New Chat" and no actual messages
    console.log("Cleaning up empty conversations...");

    // First, get all conversation IDs with "New Chat" title
    const emptyConversations = await sql`
    SELECT c.id 
    FROM conversations c 
    LEFT JOIN messages m ON c.id = m.conversation_id 
    WHERE c.title = 'New Chat' 
    GROUP BY c.id 
    HAVING COUNT(m.id) = 0
  `;

    console.log(`Found ${emptyConversations.length} empty "New Chat" conversations`);

    // Delete them
    if (emptyConversations.length > 0) {
        const ids = emptyConversations.map(c => c.id);
        await sql`DELETE FROM conversations WHERE id = ANY(${ids})`;
        console.log(`Deleted ${ids.length} conversations`);
    }

    // Also delete any orphaned messages
    await sql`
    DELETE FROM messages 
    WHERE conversation_id NOT IN (SELECT id FROM conversations)
  `;

    console.log("Cleanup complete!");
}

cleanupConversations().catch(console.error);
