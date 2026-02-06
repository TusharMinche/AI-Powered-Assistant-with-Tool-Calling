"use client";

import { useRef, useEffect, ChangeEvent } from "react";

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
            const form = e.currentTarget.closest("form");
            if (form) {
                form.requestSubmit();
            }
        }
    }

    return (
        <div className="flex items-end gap-2 p-4 bg-neutral-900 border-t border-neutral-800">
            <div className="flex-1">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={isLoading}
                    rows={1}
                    className="w-full resize-none rounded-lg border border-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-neutral-800"
                />
            </div>
            <button
                type="submit"
                disabled={!value?.trim() || isLoading}
                className="h-11 w-11 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                )}
            </button>
        </div>
    );
}
