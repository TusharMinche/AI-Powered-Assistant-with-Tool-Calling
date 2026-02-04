import {
    pgTable,
    text,
    timestamp,
    jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table - stores authenticated user information
export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").unique().notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Conversations table - stores chat sessions
export const conversations = pgTable("conversations", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New Chat"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages table - stores individual chat messages
export const messages = pgTable("messages", {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
    toolCalls: jsonb("tool_calls"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    conversations: many(conversations),
}));

export const conversationsRelations = relations(
    conversations,
    ({ one, many }) => ({
        user: one(users, {
            fields: [conversations.userId],
            references: [users.id],
        }),
        messages: many(messages),
    })
);

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
