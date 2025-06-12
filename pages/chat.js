// pages/chat.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Home.module.css'; // Menggunakan CSS Global yang sama
import { socket } from './index'; // Mengimpor instance socket dari halaman index

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [myUsername, setMyUsername] = useState('');
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('chat_username');
    if (!storedUsername) {
      router.replace('/'); // Redirect jika belum ada username
      return;
    }
    setMyUsername(storedUsername);

    // Pastikan socket sudah terhubung
    if (!socket.connected) {
      socket.connect();
    }

    socket.on('chat message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('user list', (users) => {
      setOnlineUsers(users.length);
    });

    // Cleanup saat komponen di-unmount
    return () => {
      socket.off('chat message');
      socket.off('user list');
      // Tidak disconnect socket di sini karena mungkin digunakan di halaman lain,
      // biarkan socket di _app.js atau index.js yang mengelola lifecycle-nya
    };
  }, [router]);

  useEffect(() => {
    // Gulir ke bawah setiap kali ada pesan baru
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && socket.connected) {
      socket.emit('chat message', inputMessage.trim());
      setInputMessage('');
    }
  };

  return (
    <div className={`${styles.screen} ${styles.active}`}>
      <Head>
        <title>Chat Publik</title>
      </Head>
      <div className={styles['chat-header']}>
        <h2>Chat Publik</h2>
        <div className={styles['online-users-count']}>Online: {onlineUsers}</div>
      </div>
      <ul className={styles.messages}>
        {messages.map((msg, index) => (
          <li
            key={index}
            className={msg.username === 'Sistem' ? styles['system-message'] :
                       msg.username === myUsername ? styles['my-message'] : ''}
          >
            <span>{msg.username === myUsername ? 'Anda' : msg.username} [{msg.timestamp}]:</span> {msg.message}
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>
      <form className={styles['chat-form']} onSubmit={handleSendMessage}>
        <input
          type="text"
          id="input"
          autoComplete="off"
          placeholder="Ketik pesan Anda..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit">Kirim</button>
      </form>
    </div>
  );
}
