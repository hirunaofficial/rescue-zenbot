document.addEventListener('DOMContentLoaded', () => {
    const chatLauncher = document.querySelector('.chat-launcher');
    const chatModal = document.querySelector('.chat-modal');
    const closeBtn = document.querySelector('.close-btn');
    const minimizeBtn = document.querySelector('.minimize-btn');
    const sendBtn = document.querySelector('.send-btn');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.querySelector('.chat-messages');
    const typingIndicator = document.querySelector('.typing-indicator');
    const suggestionContainer = document.querySelector('.suggestion-container');
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const newChatOption = document.getElementById('new-chat-option');
    const shareOption = document.getElementById('share-option');
    const historyOption = document.getElementById('history-option');
    const settingsOption = document.getElementById('settings-option');
    const speakersOption = document.getElementById('speakers-option');

    const SECRET_KEY = "0guFJy9GUFoMcmZ1ZA9UnAjPtn7M58sV";

    const socket = io("http://localhost:5000", {
        extraHeaders: {
            "X-Secret-Key": SECRET_KEY,
        },
    });
        
    // Suggestion messages
    const suggestions = [
        "What are the symptoms of low blood sugar?",
        "What should I do for a back injury?",
        "How do I treat an ear injury?",
        "What should I do if my clothing catches fire"
    ];

    // Function to get a random suggestion
    function getRandomSuggestions() {
        const randomSuggestions = [];
        while (randomSuggestions.length < 4) {
            const randomIndex = Math.floor(Math.random() * suggestions.length);
            if (!randomSuggestions.includes(suggestions[randomIndex])) {
                randomSuggestions.push(suggestions[randomIndex]);
            }
        }
        return randomSuggestions;
    }

    // Function to show suggestions on startup
    function showSuggestions() {
        const suggestionsHTML = `
            <div class="suggestion-container">
                <div class="suggestion-header">Ask me a question...</div>
                ${getRandomSuggestions().map(suggestion => `
                    <div class="suggestion-item">${suggestion}</div>
                `).join('')}
            </div>
        `;
    
        chatMessages.innerHTML += suggestionsHTML;
    
        // Add event delegation for suggestion items
        chatMessages.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                messageInput.value = e.target.textContent;
                sendMessage();
            }
        });
    
        scrollToBottom();
    }    

    // Function to scroll chat to the bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

   // Handle incoming messages from the server
   socket.on("chat_response", (data) => {
    setTimeout(() => {
        typingIndicator.style.display = 'none';

        const botMessageHTML = `
            <div class="message ai-message">
                <img src="assets/img/chatbot/chat-bot.png" alt="AI" class="message-avatar">
                <div class="message-content">
                    <p>${data.response}</p>
                    <span class="message-time">${getCurrentTime()}</span>
                </div>
            </div>
        `;
        chatMessages.innerHTML += botMessageHTML;
        scrollToBottom();
    }, 1500);
});

    // Handle disconnection or authentication issues
    socket.on("disconnect", (reason) => {
        if (reason === "io server disconnect") {
            alert("Disconnected by the server. Please check your secret key.");
        } else {
            console.error("Disconnected:", reason);
            showConnectionError();
        }
    });

    socket.on("connect_error", (error) => {
        console.error("Connection failed:", error);
        showConnectionError();
    });

    function showConnectionError() {
        const errorMessageHTML = `
            <div class="message system-message">
                <div class="message-content">
                    <p>Unable to connect to the server. Please try again later.</p>
                </div>
            </div>
        `;
        chatMessages.innerHTML += errorMessageHTML;
        scrollToBottom();
    }

    function toggleChat() {
        if (chatModal.style.display === 'none' || chatModal.style.display === '') {
            chatModal.style.display = 'flex';
            chatModal.style.animation = 'slideUp 0.3s ease';
            scrollToBottom();
            showSuggestions();
        } else {
            chatModal.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                chatModal.style.display = 'none';
            }, 250);
        }
    }
    

    chatLauncher.addEventListener('click', toggleChat);

    closeBtn.addEventListener('click', () => {
        chatModal.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            chatModal.style.display = 'none';
        }, 250);
    });

    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        const userMessageHTML = `
            <div class="message user-message">
                <div class="message-content">
                    <p>${message}</p>
                    <span class="message-time">${getCurrentTime()}</span>
                </div>
                <img src="assets/img/chatbot/chat-user.png" alt="User" class="message-avatar">
            </div>
        `;
        chatMessages.innerHTML += userMessageHTML;
        messageInput.value = '';
        typingIndicator.style.display = 'flex';
        socket.emit("chat_message", {
            message: message,
            secret_key: SECRET_KEY,
        });
        scrollToBottom();
    }

    function getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function addTouchSupport() {
        document.addEventListener('touchstart', (e) => {
            if (!chatModal.contains(e.target) && !chatLauncher.contains(e.target)) {
                chatModal.style.display = 'none';
            }
        });

        chatModal.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    addTouchSupport();

    messageInput.addEventListener('focus', () => {
        setTimeout(() => {
            scrollToBottom();
        }, 300);
    });

    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);

    //drop down list

    
    // Toggle dropdown menu visibility
    menuBtn.addEventListener('click', () => {
        if (dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        } else {
            dropdownMenu.style.display = 'block';
        }
    });
// Clear chat for "New Chat" option
newChatOption.addEventListener('click', () => {
    if (confirm('Are you sure you want to start a new chat? This will clear the current conversation.')) {
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <img src="assets/img/chatbot/chat-bot.png" alt="AI" class="message-avatar">
                <div class="message-content">
                    <p>Hello! I'm Rescue ZenBot. How can I assist you today?</p>
                    
                    <span class="message-time">${getCurrentTime()}</span>
                </div>
                
            </div>
            
        `;
        messageInput.value = ''; // Clear input field
        dropdownMenu.style.display = 'none'; // Hide menu after action
    }
        // Show suggestions
        showSuggestions();
});


    // Add functionality to each dropdown item
    shareOption.addEventListener('click', () => {
        alert('Share feature coming soon!');
        dropdownMenu.style.display = 'none'; // Hide menu after click
    });

    historyOption.addEventListener('click', () => {
        alert('Chat history feature coming soon!');
        dropdownMenu.style.display = 'none';
    });

    settingsOption.addEventListener('click', () => {
        alert('Settings feature coming soon!');
        dropdownMenu.style.display = 'none';
    });

    speakersOption.addEventListener('click', () => {
        const messages = document.querySelectorAll('.chat-messages .message-content p');
        const chatText = Array.from(messages).map(msg => msg.textContent).join('. ');
        const speech = new SpeechSynthesisUtterance(chatText);
        window.speechSynthesis.speak(speech);
        dropdownMenu.style.display = 'none';
    });

    // Hide dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

});