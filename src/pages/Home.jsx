import React from 'react';

function Home() {
  return (
    <div style={{
      height: '100vh',
      backgroundImage: `url("your-image-url-here")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h1 style={{ margin: 0 }}>Welcome to Car Rental DApp</h1>
      <div style={{ position: 'absolute', bottom: 0, paddingBottom: '1rem' }}>
        <p style={{ margin: 0, textAlign: 'right'}}>Created by John Nep</p>
      </div>
    </div>
  );
}

export default Home;
