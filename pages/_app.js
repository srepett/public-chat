// pages/_app.js

import '../styles/globals.css'; // Ini adalah baris penting untuk mengimpor CSS global

function MyApp({ Component, pageProps }) {
  // Component adalah halaman yang sedang aktif (misalnya, Home, Chat)
  // pageProps adalah props yang diteruskan ke halaman tersebut
  return <Component {...pageProps} />;
}

export default MyApp;
