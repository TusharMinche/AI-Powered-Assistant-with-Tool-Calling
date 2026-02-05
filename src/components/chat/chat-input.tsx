"use client";

import { useRef, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
    value?: string;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit?: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}

export function ChatInput({
    value,
    onChange,
    onSubmit,
    isLoading = false,
    placeholder = "Type your message...",
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                200
            )}px`;
        }
    }, [value]);

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // Submit the form
            const form = e.currentTarget.closest("form");
            if (form) {
                form.requestSubmit();
            }
        }
    }

    return (
        <div className="flex items-end gap-2 p-4 bg-slate-900 border-t border-slate-800">
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={isLoading}
                    rows={1}
                    className="w-full resize-none rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
            <Button
                type="submit"
                disabled={!value?.trim() || isLoading}
                className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                    </svg>
                )}
            </Button>
        </div>
    );
}
