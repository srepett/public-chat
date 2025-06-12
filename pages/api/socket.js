// pages/api/socket.js

import { Server } from 'socket.io';

// Ini adalah objek global untuk menyimpan instance Socket.IO Server.
// Di lingkungan serverless seperti Vercel, API Route mungkin diinisialisasi
// beberapa kali (cold starts), jadi kita perlu memastikan hanya ada satu
// instance Socket.IO yang berjalan per instance serverless.
const users = {}; // Objek untuk menyimpan username per socket ID.

const SocketHandler = (req, res) => {
    // Memeriksa apakah Socket.IO sudah terpasang ke server HTTP yang ada.
    if (res.socket.server.io) {
        console.log('Socket.IO sudah terpasang. Melewatkan inisialisasi.');
        res.end(); // Akhiri response karena sudah terpasang
        return;
    }

    console.log('Socket.IO sedang menginisialisasi...');
    const io = new Server(res.socket.server, {
        path: '/api/socket_io', // Path khusus untuk koneksi WebSocket
        // Mengizinkan semua origin untuk tujuan pengembangan.
        // Di produksi, Anda harus membatasi ini ke domain frontend Anda.
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Menempelkan instance io ke server HTTP yang sudah ada
    // sehingga dapat diakses oleh panggilan API berikutnya.
    res.socket.server.io = io;

    // Menangani koneksi Socket.IO
    io.on('connection', (socket) => {
        console.log('Pengguna terhubung:', socket.id);

        // Event untuk menerima username dari klien
        socket.on('set username', (username) => {
            // Catatan: Di lingkungan serverless, objek 'users' ini
            // mungkin tidak persisten di antara invocations fungsi,
            // sehingga duplikasi username bisa terjadi atau daftar online tidak akurat.
            if (username && !Object.values(users).includes(username)) {
                users[socket.id] = username;
                console.log(`Username ${username} diatur untuk ${socket.id}`);
                socket.emit('username set', username);
                io.emit('chat message', {
                    username: 'Sistem',
                    message: `${username} telah bergabung ke chat.`,
                    timestamp: new Date().toLocaleTimeString('id-ID')
                });
                io.emit('user list', Object.values(users));
            } else {
                socket.emit('username error', 'Username sudah digunakan atau tidak valid.');
            }
        });

        // Event untuk menerima pesan chat dari klien
        socket.on('chat message', (msg) => {
            const username = users[socket.id];
            if (username) {
                const chatMessage = {
                    username: username,
                    message: msg,
                    timestamp: new Date().toLocaleTimeString('id-ID')
                };
                console.log(`${username}: ${msg}`);
                io.emit('chat message', chatMessage); // Kirim pesan ke semua klien
            }
        });

        // Event saat pengguna terputus
        socket.on('disconnect', () => {
            const username = users[socket.id];
            if (username) {
                console.log('Pengguna terputus:', username, '(', socket.id, ')');
                io.emit('chat message', {
                    username: 'Sistem',
                    message: `${username} telah meninggalkan chat.`,
                    timestamp: new Date().toLocaleTimeString('id-ID')
                });
                delete users[socket.id];
                io.emit('user list', Object.values(users));
            }
        });
    });

    res.end(); // Akhiri response HTTP setelah inisialisasi
};

export default SocketHandler;
