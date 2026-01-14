(function() {
    // Check if chatbot already exists
    if (document.getElementById('chatbot-bubble')) return;

    // Add styles
    const style = document.createElement('style');
    style.innerHTML = `
        #chatbot-bubble {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #ff6900;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: transform 0.3s ease;
        }
        #chatbot-bubble:hover {
            transform: scale(1.1);
        }
        #chatbot-bubble img {
            width: 35px;
            height: 35px;
        }
        #chatbot-window {
            display: none;
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background-color: white;
            border-radius: 15px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            z-index: 9999;
            flex-direction: column;
            overflow: hidden;
            font-family: Arial, sans-serif;
        }
        #chatbot-header {
            background-color: #ff6900;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
        }
        #chatbot-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background-color: #f9f9f9;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .message {
            max-width: 80%;
            padding: 10px;
            border-radius: 10px;
            font-size: 14px;
            line-height: 1.4;
        }
        .bot-message {
            align-self: flex-start;
            background-color: #e4e6eb;
            color: black;
        }
        .user-message {
            align-self: flex-end;
            background-color: #ff6900;
            color: white;
        }
        #chatbot-input-area {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
        }
        #chatbot-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
        }
        #chatbot-send {
            background-color: #ff6900;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);

    // Create HTML elements
    const bubble = document.createElement('div');
    bubble.id = 'chatbot-bubble';
    bubble.innerHTML = '<img src="https://cdn-icons-png.flaticon.com/512/2040/2040946.png" alt="Chat">';
    
    const window = document.createElement('div');
    window.id = 'chatbot-window';
    window.innerHTML = `
        <div id="chatbot-header">
            <span>Pizza Shop Assistant</span>
            <span id="chatbot-close" style="cursor:pointer; font-size: 20px;">&times;</span>
        </div>
        <div id="chatbot-messages">
            <div class="message bot-message">Chào bạn! Pizza Shop có thể giúp gì cho bạn ạ?</div>
        </div>
        <div id="chatbot-input-area">
            <input type="text" id="chatbot-input" placeholder="Nhập tin nhắn...">
            <button id="chatbot-send">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
        </div>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(window);

    // Event Listeners
    bubble.addEventListener('click', () => {
        window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
    });

    document.getElementById('chatbot-close').addEventListener('click', () => {
        window.style.display = 'none';
    });

    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const messages = document.getElementById('chatbot-messages');

    function sendMessage() {
        const text = input.value.trim();
        if (text) {
            // User message
            const userDiv = document.createElement('div');
            userDiv.className = 'message user-message';
            userDiv.textContent = text;
            messages.appendChild(userDiv);
            input.value = '';
            messages.scrollTop = messages.scrollHeight;

            // Bot response logic
            let responseText = 'Cảm ơn bạn đã nhắn tin. Nhân viên của chúng tôi sẽ phản hồi sớm nhất có thể!';
            
            if (text.toLowerCase().includes('nên đầu tư vào gì')) {
                responseText = 'Đầu tư vào HDPE là ngon luôn';
            }

            // Simple bot response
            setTimeout(() => {
                const botDiv = document.createElement('div');
                botDiv.className = 'message bot-message';
                botDiv.textContent = responseText;
                messages.appendChild(botDiv);
                messages.scrollTop = messages.scrollHeight;
            }, 1000);
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
})();
