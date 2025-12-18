
import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import { authClient, useSession } from '../../lib/auth-client';
import { AuthPopup } from '../AuthPopup';

// Types
interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
}

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { data: session } = useSession();

    // Initial message only added once or if session changes (optional logic)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I am your AI assistant. How can I help you today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!session) {
            setIsAuthModalOpen(true);
            return;
        }

        if (!inputValue.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('https://huzaifa1102-book-rag-bot.hf.space/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: newUserMessage.text }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.answer || "Sorry, I couldn't understand that.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);

        } catch (error) {
            console.error('Error fetching chat response:', error);
            const errorResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble connecting to the server right now. Please try again later.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleLoginClick = () => {
        setIsAuthModalOpen(true);
    };

    return (
        <>
            <div className={styles.container}>
                {isOpen && (
                    <div className={styles.chatWindow}>
                        <div className={styles.header}>
                            <div className={styles.headerInfo}>
                                <div className={styles.avatar}>
                                    <RobotIcon />
                                </div>
                                <div className={styles.titleContainer}>
                                    <span className={styles.title}>AI Assistant</span>
                                    <span className={styles.status}>
                                        <span className={styles.statusDot}></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                className={styles.closeButton}
                                onClick={() => setIsOpen(false)}
                                aria-label="Close chat"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className={styles.messagesContainer}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={clsx(
                                        styles.message,
                                        msg.sender === 'bot' ? styles.botMessage : styles.userMessage
                                    )}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {isTyping && (
                                <div className={clsx(styles.message, styles.botMessage)}>
                                    Typing...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className={styles.inputWrapper}>
                            {!session ? (
                                <div className={styles.loginOverlay}>
                                    <button onClick={handleLoginClick} className={styles.loginButton}>
                                        Login to Chat
                                    </button>
                                </div>
                            ) : (
                                <form className={styles.inputArea} onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Type a message..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className={styles.sendButton}
                                        disabled={!inputValue.trim() || isTyping}
                                        aria-label="Send message"
                                    >
                                        <SendIcon />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                <button
                    className={clsx(styles.toggleButton, !isOpen && styles.pulse)}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle chat"
                >
                    {isOpen ? <CloseIcon /> : <ChatIcon />}
                </button>
            </div>

            <AuthPopup
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => setIsAuthModalOpen(false)}
            />
        </>
    );
};

// Icons

const ChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const SendIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const RobotIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2"></rect>
        <circle cx="12" cy="5" r="2"></circle>
        <path d="M12 7v4"></path>
        <line x1="8" y1="16" x2="8" y2="16"></line>
        <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>
);

export default ChatBot;
