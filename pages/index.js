// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Home.module.css'; // Menggunakan CSS Global yang sama

// Ini adalah instance Socket.IO client.
// Kita akan menginisialisasinya di _app.js dan menyediakannya melalui context
// atau menginisialisasi di sini jika hanya digunakan di satu tempat.
// Untuk Next.js, lebih baik menggunakan useEffect untuk koneksi.
import io from 'socket.io-client';

let socket; // Variabel global untuk instance socket client

export default function Home() {
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Inisialisasi socket hanya sekali di client-side
    // Pastikan path sesuai dengan API Route Socket.IO
    socket = io({ path: '/api/socket_io' });

    socket.on('connect', () => {
      console.log('Terhubung ke server Socket.IO');
    });

    socket.on('username set', (name) => {
      // Simpan username di localStorage agar bisa diakses di halaman chat
      localStorage.setItem('chat_username', name);
      router.push('/chat'); // Redirect ke halaman chat
    });

    socket.on('username error', (message) => {
      setErrorMessage(message);
    });

    socket.on('disconnect', () => {
      console.log('Terputus dari server Socket.IO');
      setErrorMessage('Koneksi terputus. Silakan coba lagi.');
    });

    // Cleanup saat komponen di-unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [router]); // Router sebagai dependency agar useEffect tahu kapan harus re-run jika router berubah

  const handleSetUsername = () => {
    if (username.trim()) {
      socket.emit('set username', username.trim());
    } else {
      setErrorMessage('Username tidak boleh kosong!');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSetUsername();
    }
  };

  return (
    <div className={`${styles.screen} ${styles['login-screen']} ${styles.active}`}>
      <Head>
        <title>Login Chat Publik</title>
      </Head>
      <h1>Selamat Datang di Chat Publik!</h1>
      <p>Silakan masukkan nama pengguna Anda:</p>
      <input
        type="text"
        id="username-input"
        placeholder="Masukkan Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button id="set-username-btn" onClick={handleSetUsername}>
        Masuk Chat
      </button>
      {errorMessage && <p className={styles['error-msg']}>{errorMessage}</p>}
    </div>
  );
}

// Export socket instance agar bisa diimpor di halaman lain
export { socket };
