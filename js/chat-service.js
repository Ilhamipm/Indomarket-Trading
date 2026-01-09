/**
 * Chat Service - Serverless (MQTT Version)
 * Connects to Public Broker for Global Chat
 */

class ChatService {
    constructor() {
        this.client = null;
        this.userId = this.getPersistentId();

        // Public Broker (Free, reliable for demos)
        // Using WebSockets (wss) on port 8084
        this.brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
        this.topicChat = 'indomarket/public/chat/v1';
        this.topicPresence = 'indomarket/public/presence/v1';

        // Presence Tracking
        this.peers = new Map(); // Map<UserId, LastSeenTimestamp>
        this.cleanupInterval = null;
        this.heartbeatInterval = null;

        // UI Elements
        this.widget = document.getElementById('chat-widget');
        this.messagesEl = document.getElementById('chat-messages');
        this.inputEl = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('chat-send-btn');
        this.toggleIcon = document.getElementById('chat-toggle-icon');
        this.countEl = document.getElementById('online-count');
        this.chatCountEl = document.getElementById('chat-online-count');

        this.init();
    }

    getPersistentId() {
        let id = localStorage.getItem('indomarket_user_id');
        if (!id) {
            id = 'USER-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            localStorage.setItem('indomarket_user_id', id);
        }
        return id;
    }

    init() {
        console.log(`Connecting to Global Chat Broker as ${this.userId}...`);

        try {
            // Connect to MQTT Broker
            this.client = mqtt.connect(this.brokerUrl, {
                clientId: this.userId + '-' + Math.random().toString(16).substr(2, 8),
                keepalive: 60,
                clean: true
            });

            this.client.on('connect', () => {
                console.log("Connected to MQTT Broker!");

                // Subscribe to channels
                this.client.subscribe(this.topicChat);
                this.client.subscribe(this.topicPresence);

                // Announce Presence immediately
                this.sendHeartbeat();
                this.addSystemMessage("Connected to Global Server.");
            });

            this.client.on('message', (topic, message) => {
                this.handleIncoming(topic, message.toString());
            });

            this.client.on('error', (err) => {
                console.error("MQTT Error:", err);
                this.addSystemMessage("Connection Error. Retrying...");
            });

        } catch (e) {
            console.error("Chat Init Failed:", e);
        }

        // 2. UI Listeners
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // 3. Presence System (Heartbeat)
        // Send "I am here" every 15 seconds
        this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 15000);

        // Check for offline peers every 5 seconds
        this.cleanupInterval = setInterval(() => this.updateOnlineCount(), 5000);
    }

    handleIncoming(topic, payload) {
        try {
            const data = JSON.parse(payload);

            if (topic === this.topicChat) {
                this.addMessageToUI(data);
            } else if (topic === this.topicPresence) {
                // Update peer last seen
                if (data.id) {
                    this.peers.set(data.id, Date.now());
                    this.updateOnlineCount(); // Update count UI immediately on new peer
                }
            }
        } catch (e) {
            console.warn("Invalid message payload", e);
        }
    }

    sendHeartbeat() {
        if (!this.client || !this.client.connected) return;
        const payload = JSON.stringify({ id: this.userId, status: 'online' });
        this.client.publish(this.topicPresence, payload);
    }

    updateOnlineCount() {
        const now = Date.now();
        const timeout = 40000; // Consider offline if not seen for 40s

        // Always count self
        this.peers.set(this.userId, now);

        let activeCount = 0;
        for (const [id, lastSeen] of this.peers.entries()) {
            if (now - lastSeen < timeout) {
                activeCount++;
            } else {
                this.peers.delete(id); // Remove stale peer
            }
        }

        // Update UI
        activeCount = Math.max(1, activeCount); // Min 1 (Self)
        if (this.countEl) this.countEl.innerText = `${activeCount} Online`;
        if (this.chatCountEl) this.chatCountEl.innerText = `(${activeCount})`;
    }

    sendMessage() {
        const text = this.inputEl.value.trim();
        if (!text) return;

        const msgPayload = JSON.stringify({
            id: this.userId,
            text: text,
            timestamp: Date.now()
        });

        // Publish to Global Chat Topic
        if (this.client && this.client.connected) {
            this.client.publish(this.topicChat, msgPayload);
        } else {
            this.addSystemMessage("Not connected. Message not sent.");
        }

        // Clear input
        this.inputEl.value = '';
    }

    addMessageToUI(msg) {
        const isSelf = msg.id === this.userId;
        const div = document.createElement('div');
        div.className = `chat-msg ${isSelf ? 'self' : ''}`;

        div.innerHTML = `
            <span class="sender">${isSelf ? 'YOU' : msg.id}</span>
            <span class="text">${this.escapeHtml(msg.text)}</span>
        `;

        this.messagesEl.appendChild(div);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight; // Auto-scroll
    }

    addSystemMessage(text) {
        const div = document.createElement('div');
        div.className = 'chat-system-msg';
        div.innerText = text;
        this.messagesEl.appendChild(div);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    escapeHtml(text) {
        if (!text) return "";
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }
}

// Global Toggle Function
window.toggleChat = function () {
    const widget = document.getElementById('chat-widget');
    const icon = document.getElementById('chat-toggle-icon');

    widget.classList.toggle('collapsed');

    if (widget.classList.contains('collapsed')) {
        icon.className = 'bx bx-chevron-up';
    } else {
        icon.className = 'bx bx-chevron-down';
    }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    // Only init if not already existing
    if (!window.ChatApp) {
        window.ChatApp = new ChatService();
    }
});
